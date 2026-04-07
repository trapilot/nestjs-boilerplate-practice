import { Injectable } from '@nestjs/common'
import { EnumJobStatus, Prisma } from '@runtime/prisma-client'
import {
  HelperService,
  IWorkerPublishOptions,
  IWorkerRepublishOptions,
  RunnerService,
  WorkerProducer,
} from 'lib/nest-core'
import { PrismaService } from '../services'
import { PrismaUtil } from '../utils'

@Injectable()
export class PrismaWorkerProducer extends WorkerProducer {
  constructor(
    private readonly prisma: PrismaService,
    private readonly runner: RunnerService,
    private readonly helperService: HelperService,
  ) {
    super()
  }

  async publish<T>(topic: string, options: IWorkerPublishOptions<T>): Promise<void> {
    const nowDate = this.helperService.dateNow(true)
    const runDate = this.helperService.dateForward(nowDate, {
      milliseconds: Math.abs(options?.delayMs ?? 0),
    })
    const thresholdDate = this.helperService.dateForward(runDate, {
      minutes: options?.threshold ?? 30, // Failed after 30 minutes running
    })

    const exclusive = options.exclusive === true
    const hashName = exclusive ? this.buildJobHash(topic, options.version, options.message) : null

    await this.runner.retry(
      () =>
        this.prisma.queueJob.create({
          data: {
            jobName: topic,
            jobHash: hashName,
            version: options.version,
            priority: options.priority,
            startAt: options?.startDate ?? runDate,
            thresholdAt: thresholdDate,
            payload: options?.message as Prisma.JsonValue,
            retryCount: 0,
            persistent: options?.persistent,
            maxRetries: options?.attempts,
            status: EnumJobStatus.PENDING,
          },
        }),
      {
        retries: 5,
        minDelayMs: 100,
        maxDelayMs: 2000,
        shouldRetry: err => {
          if (PrismaUtil.isDeadlockError(err)) return true
          if (PrismaUtil.isTimeoutError(err)) return true
          return false
        },
        shouldThrow: err => {
          if (PrismaUtil.isUniqueError(err)) return !exclusive
          return true
        },
      },
    )
  }

  async republish<T>(topic: string, options: IWorkerRepublishOptions<T>): Promise<void> {
    return await this.publish<T>(topic, {
      ...options,
      delayMs: options?.delayMs ?? 1000, // default delay 1s
      exclusive: false,
    })
  }

  private buildJobHash<T>(jobName: string, version: number, payload?: T): string {
    return this.helperService.hashCreate(JSON.stringify({ jobName, version, payload }), {
      algorithm: 'sha256',
    })
  }
}
