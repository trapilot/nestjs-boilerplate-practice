import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { availableParallelism } from 'os'
import PQueue from 'p-queue'
import { join } from 'path'
import Piscina from 'piscina'

export interface IRunnerQueueStats {
  name?: string
  size: number
  pending: number
  concurrency: number
  isPaused: boolean
  isIdle: boolean
}

export interface IRunnerTaskMetadata {
  queueName: string
  taskId: string
  startedAt: number
  attempt?: number
}

export interface IRunnerQueueOptions {
  concurrency?: number
  intervalCap?: number
  intervalMs?: number
  timeoutMs?: number
  retry?: IRunnerRetryOptions
  hooks?: IRunnerTaskHooks
  circuit?: IRunnerCircuitOptions
}

export interface IRunnerRetryOptions {
  retries?: number
  minDelayMs?: number
  maxDelayMs?: number
  shouldRetry?: (error: unknown) => boolean
  shouldThrow?: (error: unknown) => boolean
  onFailedCompletely?: (error: unknown, meta: { queueName: string }) => void | Promise<void>
}

export interface IRunnerCircuitOptions {
  failureThreshold?: number
  cooldownMs?: number
}

export interface IRunnerTaskHooks {
  onStart?: (meta: IRunnerTaskMetadata) => void | Promise<void>
  onSuccess?: (meta: IRunnerTaskMetadata & { durationMs: number }) => void | Promise<void>
  onFailure?: (meta: IRunnerTaskMetadata & { error: unknown }) => void | Promise<void>
  onRetry?: (
    meta: IRunnerTaskMetadata & {
      error: unknown
      attempt: number
      delayMs: number
    },
  ) => void | Promise<void>
  onCircuitOpen?: (meta: { queueName: string }) => void | Promise<void>
}

@Injectable()
export class RunnerService implements OnModuleDestroy {
  private readonly queues = new Map<string, PQueue>()
  private readonly circuits = new Map<string, FastCircuitBreaker>()
  private readonly workerPools = new Map<string, Piscina>()
  private readonly queueOptions = new Map<string, IRunnerQueueOptions>()

  private readonly defaultQueue: IRunnerQueueOptions = {
    concurrency: 2,
  }

  private readonly defaultRetry: Required<IRunnerRetryOptions> = {
    retries: 0,
    minDelayMs: 100,
    maxDelayMs: 30_000,
    shouldRetry: () => true,
    shouldThrow: () => true,
    onFailedCompletely: async () => {},
  }

  private readonly defaultHooks: Required<IRunnerTaskHooks> = {
    onStart: async () => {},
    onSuccess: async () => {},
    onFailure: async () => {},
    onRetry: async () => {},
    onCircuitOpen: async () => {},
  }

  private readonly defaultCircuit: Required<IRunnerCircuitOptions> = {
    failureThreshold: 5,
    cooldownMs: 10_000,
  }

  /**
   * Run task in a dynamic queue
   * Queue will be created lazily if not exists
   */
  async run<T>(
    queueName: string,
    taskFn: () => Promise<T>,
    opts?: IRunnerQueueOptions,
  ): Promise<T> {
    const queue = this.getOrCreateQueue(queueName, opts)
    const circuit = this.getOrCreateCircuit(queueName, opts?.circuit)
    const retry = this.resolveRetry(queueName, opts?.retry)
    const hooks = this.resolveHooks(queueName, opts?.hooks)

    return queue.add(async () => {
      const meta = this.createMetadata(queueName)

      await hooks.onStart(meta)

      try {
        const result = await this.retryWithBackoff(
          () => this.withTimeout(taskFn, opts?.timeoutMs),
          meta,
          retry,
          hooks,
        )

        circuit.success()

        await hooks.onSuccess({
          ...meta,
          durationMs: Date.now() - meta.startedAt,
        })

        return result
      } catch (err: unknown) {
        const opened = circuit.failure()

        if (opened) {
          await hooks.onCircuitOpen({ queueName })
        }

        await hooks.onFailure({
          ...meta,
          error: err,
        })

        await retry.onFailedCompletely(err, { queueName })

        throw err
      }
    })
  }

  /**
   * Run queue task in a worker
   * Queue will be created lazily if not exists
   */
  async runWorker<T>(
    queueName: string,
    workerPath: string,
    payload: any,
    opts?: IRunnerQueueOptions & {
      sharedBuffer?: SharedArrayBuffer
    },
  ): Promise<T> {
    return this.run(
      queueName,
      async () => {
        const pool = this.getOrCreateWorkerPool(workerPath)
        const controller = new AbortController()

        const task = pool.run(
          {
            workerPath,
            payload,
            sharedBuffer: opts?.sharedBuffer,
          },
          { signal: controller.signal },
        )

        let timeout: NodeJS.Timeout | undefined

        if (opts?.timeoutMs) {
          timeout = setTimeout(() => {
            controller.abort()
          }, opts.timeoutMs)
        }

        try {
          const result = await task
          clearTimeout(timeout)
          return result
        } catch (err) {
          clearTimeout(timeout)
          throw err
        }
      },
      { ...opts, timeoutMs: undefined },
    )
  }

  /**
   * Retry task without queue
   */
  async retry<T>(task: () => Promise<T>, opts?: IRunnerRetryOptions): Promise<T> {
    const retry = { ...this.defaultRetry, ...opts }
    const meta = this.createMetadata('standalone')

    return this.retryWithBackoff(task, meta, retry, this.defaultHooks)
  }

  /* ================================
     Retry Engine (Exponential + Jitter)
  ================================ */

  private async retryWithBackoff<T>(
    taskFn: () => Promise<T>,
    meta: IRunnerTaskMetadata,
    policy: Required<IRunnerRetryOptions>,
    hooks: Required<IRunnerTaskHooks>,
  ): Promise<T> {
    for (let attempt = 0; attempt <= policy.retries; attempt++) {
      try {
        return await taskFn()
      } catch (err) {
        if (!policy.shouldThrow(err)) return // bypass

        if (attempt === policy.retries || !policy.shouldRetry(err)) {
          throw err
        }

        const delay = this.computeBackoff(attempt, policy.minDelayMs, policy.maxDelayMs)

        await hooks.onRetry({
          ...meta,
          attempt: attempt + 1,
          error: err,
          delayMs: delay,
        })

        await new Promise(r => setTimeout(r, delay))
      }
    }
  }

  private computeBackoff(attempt: number, baseDelay: number, maxDelay: number): number {
    const exp = Math.min(maxDelay, baseDelay * 2 ** attempt)
    return Math.random() * exp // full jitter
  }

  // =========================
  // Queue & Pool
  // =========================

  private getOrCreateQueue(name: string, opts?: IRunnerQueueOptions): PQueue {
    let queue = this.queues.get(name)
    if (queue) return queue

    const merged: IRunnerQueueOptions = {
      ...this.defaultQueue,
      ...opts,
    }

    const hasInterval = this.validateInterval(merged)

    if (hasInterval) {
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
    this.queueOptions.set(name, merged)
    return queue
  }

  private getOrCreateWorkerPool(workerPath: string): Piscina {
    let resolvedPath: string

    try {
      resolvedPath = require.resolve(workerPath)
    } catch (err) {
      throw new Error(`Worker not found: ${workerPath}`)
    }

    if (this.workerPools.has(resolvedPath)) {
      return this.workerPools.get(resolvedPath)!
    }

    const cpu = availableParallelism()

    const pool = new Piscina({
      filename: join(__dirname, '../workers/dispatcher.worker.js'), // dynamic workers with only 1 thread pool
      minThreads: Math.max(1, Math.floor(cpu * 0.5)), // leave 50% core for event loop
      maxThreads: cpu,
      maxQueue: 'auto',
      idleTimeout: 30_000,
      concurrentTasksPerWorker: 1,
    })

    this.workerPools.set(resolvedPath, pool)
    return pool
  }

  private getOrCreateCircuit(
    name: string,
    override?: IRunnerCircuitOptions,
  ): Required<FastCircuitBreaker> {
    if (this.circuits.has(name)) {
      return this.circuits.get(name)!
    }

    const base = this.queueOptions.get(name)?.circuit ?? {}

    const merged = {
      ...this.defaultCircuit,
      ...base,
      ...override,
    }

    const breaker = new FastCircuitBreaker(merged)

    this.circuits.set(name, breaker)

    return breaker
  }

  /* ================================
    Helpers
  ================================ */

  private resolveRetry(
    name: string,
    override?: IRunnerRetryOptions,
  ): Required<IRunnerRetryOptions> {
    const base = this.queueOptions.get(name)?.retry ?? {}

    const merged = {
      ...this.defaultRetry,
      ...base,
      ...override,
    }

    return {
      ...this.defaultRetry,
      ...this.queueOptions.get(name)?.retry,
      ...override,
    }
  }

  private resolveHooks(name: string, override?: IRunnerTaskHooks): Required<IRunnerTaskHooks> {
    const base = this.queueOptions.get(name)?.hooks ?? {}

    const merged = {
      ...this.defaultHooks,
      ...base,
      ...override,
    }

    return {
      onStart: this.withSafe(merged.onStart),
      onSuccess: this.withSafe(merged.onSuccess),
      onFailure: this.withSafe(merged.onFailure),
      onRetry: this.withSafe(merged.onRetry),
      onCircuitOpen: this.withSafe(merged.onCircuitOpen),
    }
  }

  /* ================================
    Utils
  ================================ */

  private createMetadata(queueName: string): IRunnerTaskMetadata {
    const startedAt = Date.now()

    return {
      queueName,
      startedAt,
      taskId: `${startedAt}:${Math.random()}`,
    }
  }

  private validateInterval(opts: IRunnerQueueOptions): boolean {
    const hasCap = opts.intervalCap != null
    const hasMs = opts.intervalMs != null

    if (hasCap !== hasMs) {
      throw new Error('intervalCap and intervalMs must be provided together')
    }

    if (hasCap && (opts.intervalCap! <= 0 || opts.intervalMs! <= 0)) {
      throw new Error('intervalCap and intervalMs must be > 0')
    }

    return hasCap && hasMs
  }

  private withSafe = <T extends (...args: any[]) => any>(fn?: T): T => {
    return (async (...args: any[]) => {
      try {
        return await fn?.(...args)
      } catch (err: unknown) {
        console.error('Safe Excution Error:', err)
      }
    }) as T
  }

  private withTimeout<T>(task: () => Promise<T>, timeoutMs?: number): Promise<T> {
    if (!timeoutMs) return task()

    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Task timeout'))
      }, timeoutMs)

      task()
        .then(result => {
          clearTimeout(timer)
          resolve(result)
        })
        .catch(err => {
          clearTimeout(timer)
          reject(err)
        })
    })
  }

  // =========================
  // Observability
  // =========================

  stats(name: string): IRunnerQueueStats | null {
    const q = this.queues.get(name)
    if (!q) return null

    return {
      size: q.size,
      pending: q.pending,
      concurrency: q.concurrency,
      isPaused: q.isPaused,
      isIdle: q.size === 0 && q.pending === 0,
    }
  }

  allStats(): IRunnerQueueStats[] {
    return [...this.queues.keys()]
      .map(name => {
        const stat = this.stats(name)
        if (!stat) return null
        return { name, ...stat }
      })
      .filter(Boolean)
  }

  pause(name: string): void {
    this.queues.get(name)?.pause()
  }

  resume(name: string): void {
    this.queues.get(name)?.start()
  }

  // =========================
  // Lifecycle
  // =========================

  async shutdown(timeoutMs = 30_000) {
    // Stop accepting new tasks
    for (const q of this.queues.values()) {
      q.pause()
    }

    // Wait running tasks finish
    await this.waitForIdle(undefined, timeoutMs)

    // Destroy worker pools
    for (const pool of this.workerPools.values()) {
      await pool.destroy()
    }
  }

  async waitForIdle(name?: string, timeoutMs?: number): Promise<void> {
    const wait = async (q: PQueue) => {
      if (!timeoutMs) {
        await q.onIdle()
        return
      }

      await Promise.race([
        q.onIdle(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('waitForIdle timeout')), timeoutMs),
        ),
      ])
    }

    if (name) {
      const q = this.queues.get(name)
      if (!q) return
      await wait(q)
      return
    }

    for (const q of this.queues.values()) {
      await wait(q)
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.shutdown()
  }
}

/* ================================
   Circuit Breaker
================================ */
enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

class FastCircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'
  private failures = 0
  private openedAt = 0
  private probeInFlight = false

  constructor(private readonly config: Required<IRunnerCircuitOptions>) {}

  enter() {
    const now = Date.now()

    switch (this.state) {
      case CircuitState.OPEN:
        if (now - this.openedAt < this.config.cooldownMs) {
          throw new Error('Circuit OPEN')
        }
        this.state = CircuitState.HALF_OPEN
        this.probeInFlight = true
        return

      case CircuitState.HALF_OPEN:
        if (this.probeInFlight) {
          throw new Error('Circuit HALF_OPEN (probe running)')
        }
        this.probeInFlight = true
        return

      case CircuitState.CLOSED:
        return
    }
  }

  success() {
    this.failures = 0
    this.probeInFlight = false
    this.state = CircuitState.CLOSED
  }

  failure(): boolean {
    this.failures++
    this.probeInFlight = false

    if (this.failures >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN
      this.openedAt = Date.now()
      return true
    }

    return false
  }
}
