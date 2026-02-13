import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
import { CronJob } from 'cron'
import { ISchedulerBus, ISchedulerOptions } from '../interfaces'
import { HelperService } from '../services'
// import Redis from 'ioredis'

interface IScheduleItem {
  job: CronJob
  running: boolean
  options: ISchedulerOptions
}

@Injectable()
export class SchedulerBus implements ISchedulerBus, OnModuleDestroy {
  private readonly logger = new Logger(SchedulerBus.name)
  private readonly registry = new Map<string, IScheduleItem>()
  // private readonly redis?: Redis

  constructor(private readonly helperService: HelperService) {
    // // optional redis (only if needed)
    // if (process.env.SCHEDULER_USE_REDIS === 'true') {
    //   this.redis = new Redis(process.env.REDIS_URL!)
    // }
  }

  cron(expression: string, handler: () => Promise<void>, options: ISchedulerOptions = {}): string {
    const name = this.buildJobName(options.name)

    if (this.registry.has(name)) {
      throw new Error(`Cron ${name} already exists`)
    }

    const { timeZone, disabled, ...restOptions } = options

    const job = new CronJob(
      expression,
      () => this.execute(name, handler),
      undefined,
      false,
      timeZone,
    )

    this.registry.set(name, {
      job,
      running: false,
      options: {
        timeoutMs: 60_000,
        preventOverlap: true,
        useRedisLock: false,
        lockTtlMs: 55_000,
        ...restOptions,
      },
    })

    if (!disabled) {
      job.start()
    }

    return name
  }

  private async execute(name: string, handler: () => Promise<void>): Promise<void> {
    const item = this.registry.get(name)
    if (!item) return

    // const { preventOverlap, timeoutMs, useRedisLock, lockTtlMs } = item.options
    const { preventOverlap, timeoutMs } = item.options

    // Prevent overlap (local)
    if (preventOverlap && item.running) {
      this.logger.warn(`Cron skipped (overlap): ${name}`)
      return
    }

    // // Distributed lock (multi-pod)
    // if (useRedisLock && this.redis) {
    //   const lockKey = `scheduler:lock:${name}`
    //   const locked = await this.redis.set(lockKey, '1', 'PX', lockTtlMs, 'NX')

    //   if (!locked) {
    //     this.logger.warn(`Cron skipped (redis lock): ${name}`)
    //     return
    //   }
    // }

    item.running = true

    try {
      await this.runWithTimeout(handler, timeoutMs!)
    } catch (err) {
      this.logger.error(`Cron failed: ${name}`, err)
    } finally {
      item.running = false
    }
  }

  private buildJobName(name: string): string {
    return `scheduler:job:${name || this.helperService.createUuid()}`
  }

  private async runWithTimeout(fn: () => Promise<void>, timeoutMs: number): Promise<void> {
    return Promise.race([
      fn(),
      new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error('Cron timeout')), timeoutMs),
      ),
    ])
  }

  enable(name: string): void {
    const item = this.registry.get(name)
    if (!item) return

    item.job.start()
  }

  disable(name: string): void {
    const item = this.registry.get(name)
    if (!item) return

    item.job.stop()
  }

  remove(name: string): void {
    const item = this.registry.get(name)
    if (!item) return

    item.job.stop()
    this.registry.delete(name)
  }

  async shutdown(): Promise<void> {
    for (const item of this.registry.values()) {
      item.job.stop()
    }
    // this.redis?.disconnect()
  }

  async onModuleDestroy(): Promise<void> {
    await this.shutdown()
  }
}
