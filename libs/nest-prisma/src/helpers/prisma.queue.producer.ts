import { Injectable } from '@nestjs/common'
import { EnumJobStatus, Prisma } from '@runtime/prisma-client'
import {
  HelperService,
  IQueuePublishOptions,
  IQueueRepublishOptions,
  QueueProducer,
  RunnerService,
} from 'lib/nest-core'
import { PrismaService } from '../services'
import { PrismaUtil } from '../utils'

@Injectable()
export class PrismaQueueProducer extends QueueProducer {
  constructor(
    private readonly prisma: PrismaService,
    private readonly runner: RunnerService,
    private readonly helperService: HelperService,
  ) {
    super()
  }

  // @OnScope(EnumScopeType.QUEUE, { context: 'producer', async: true })
  async publish<T>(topic: string, options: IQueuePublishOptions<T>): Promise<void> {
    const nowDate = this.helperService.dateNow(true)
    const runDate = this.helperService.dateForward(nowDate, {
      milliseconds: Math.abs(options?.delayMs ?? 0),
    })
    const thresholdDate = this.helperService.dateForward(runDate, {
      minutes: options?.threshold ?? 30, // Failed after 30 minutes running
    })

    const exclusive = options.exclusive === true
    const hashName = exclusive ? this.buildJobHash(topic, options.version) : null

    await this.runner.retry(
      async () => {
        try {
          await this.prisma.queueJob.create({
            data: {
              jobName: topic,
              jobHash: hashName,
              version: options.version,
              priority: options.priority,
              startAt: options?.startDate ?? runDate,
              thresholdAt: thresholdDate,
              payload: options?.message as Prisma.JsonValue,
              retryCount: 0,
              autoDelete: options?.autoDelete,
              maxRetries: options?.attempts,
              status: EnumJobStatus.PENDING,
            },
          })
        } catch (err) {
          // exclusive job already exists → ignore
          if (exclusive && PrismaUtil.isUniqueError(err)) {
            return
          }
          throw err
        }
      },
      {
        retries: 5,
        minDelayMs: 100,
        maxDelayMs: 2000,
        shouldRetry: err => this.isRetryable(err),
        onFailedRetry: context => console.log({ context }),
      },
    )
  }

  async republish<T>(topic: string, options: IQueueRepublishOptions<T>): Promise<void> {
    return await this.publish<T>(topic, {
      autoDelete: true,
      ...options,
      delayMs: options?.delayMs ?? 1000, // default delay 1s
      exclusive: false,
    })
  }

  private isRetryable(err: unknown): boolean {
    if (PrismaUtil.isDeadlockError(err)) return true
    if (PrismaUtil.isTimeoutError(err)) return true
    return false
  }

  private buildJobHash<T>(jobName: string, version: number): string {
    return this.helperService.hashCreate(JSON.stringify({ jobName, version }), {
      algorithm: 'sha256',
    })
  }
}
