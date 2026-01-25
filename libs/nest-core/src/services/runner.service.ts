import { Injectable, OnModuleDestroy } from '@nestjs/common'
import PQueue from 'p-queue'
import pRetry, { RetryContext } from 'p-retry'

export interface RunnerRetryOptions {
  retries?: number
  minDelayMs?: number
  maxDelayMs?: number
  shouldRetry?: (error: unknown) => boolean
  onFailedRetry?: (context: RetryContext) => void
}

export interface RunnerQueueOptions {
  concurrency?: number
  intervalCap?: number
  intervalMs?: number
  retry?: RunnerRetryOptions
}

@Injectable()
export class RunnerService implements OnModuleDestroy {
  private readonly queues = new Map<string, PQueue>()
  private readonly options = new Map<string, RunnerQueueOptions>()

  private readonly defaultOptions: RunnerQueueOptions = {
    concurrency: 2,
    retry: { retries: 0 },
  }

  private readonly defaultRetry: Required<RunnerRetryOptions> = {
    retries: 0,
    minDelayMs: 0,
    maxDelayMs: 30_000, // avoid Infinity
    shouldRetry: () => true,
    onFailedRetry: () => true,
  }

  /**
   * Run task in a dynamic queue
   * Queue will be created lazily if not exists
   */
  async run<T>(queueName: string, task: () => Promise<T>, opts?: RunnerQueueOptions): Promise<T> {
    const queue = this.getOrCreateQueue(queueName, opts)
    const retry = this.resolveRetry(queueName, opts?.retry)

    return queue.add(() =>
      retry.retries > 0
        ? pRetry(task, {
            retries: retry.retries,
            minTimeout: retry.minDelayMs,
            maxTimeout: retry.maxDelayMs,
            shouldRetry: retry.shouldRetry,
            onFailedAttempt: retry.onFailedRetry,
          })
        : task(),
    )
  }

  /**
   * Retry task without queue
   */
  async retry<T>(task: () => Promise<T>, opts?: RunnerRetryOptions): Promise<T> {
    const merged = { ...this.defaultRetry, ...opts }

    if (merged.retries <= 0) {
      return task()
    }

    return pRetry(task, {
      retries: merged.retries,
      minTimeout: merged.minDelayMs || undefined,
      maxTimeout: merged.maxDelayMs || undefined,
      shouldRetry: merged.shouldRetry,
    })
  }

  /**
   * Explicit queue registration (optional)
   */
  registerQueue(name: string, opts?: RunnerQueueOptions): void {
    this.getOrCreateQueue(name, opts)
  }

  // =========================
  // Internals
  // =========================

  private getOrCreateQueue(name: string, opts?: RunnerQueueOptions): PQueue {
    let queue = this.queues.get(name)
    if (queue) return queue

    const merged: RunnerQueueOptions = {
      ...this.defaultOptions,
      ...opts,
      retry: opts?.retry ? { ...opts.retry } : this.defaultOptions.retry,
    }

    // ===== Validate interval options =====
    const hasIntervalCap = merged.intervalCap != null
    const hasIntervalMs = merged.intervalMs != null

    if (hasIntervalCap !== hasIntervalMs) {
      throw new Error('intervalCap and intervalMs must be provided together')
    }

    if (typeof merged.intervalCap === 'number' && typeof merged.intervalMs === 'number') {
      if (merged.intervalCap <= 0 || merged.intervalMs <= 0) {
        throw new Error('intervalCap and intervalMs must be greater than 0')
      }

      queue = new PQueue({
        concurrency: merged.concurrency,
        intervalCap: merged.intervalCap,
        interval: merged.intervalMs,
      })
    } else {
      queue = new PQueue({
        concurrency: merged.concurrency,
      })
    }

    this.queues.set(name, queue)
    this.options.set(name, merged)
    return queue
  }

  private resolveRetry(name: string, override?: RunnerRetryOptions): Required<RunnerRetryOptions> {
    const base = this.options.get(name)?.retry ?? {}

    const merged = {
      ...this.defaultRetry,
      ...base,
      ...override,
    }

    return {
      retries: merged.retries ?? 0,
      minDelayMs: merged.minDelayMs ?? 0,
      maxDelayMs: merged.maxDelayMs ?? 30_000,
      shouldRetry: merged.shouldRetry ?? (() => true),
      onFailedRetry: merged.onFailedRetry ?? (() => true),
    }
  }

  // =========================
  // Observability
  // =========================

  stats(name: string) {
    const q = this.queues.get(name)
    if (!q) return null

    return {
      size: q.size,
      pending: q.pending,
      concurrency: q.concurrency,
      isIdle: q.size === 0 && q.pending === 0,
    }
  }

  pause(name: string) {
    this.queues.get(name)?.pause()
  }

  resume(name: string) {
    this.queues.get(name)?.start()
  }

  // =========================
  // Lifecycle
  // =========================

  async onModuleDestroy() {
    for (const q of this.queues.values()) {
      q.clear()
      await q.onIdle()
    }
  }
}
