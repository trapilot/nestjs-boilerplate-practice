import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { EnumJobStatus } from '@runtime/prisma-client'
import {
  AppUtil,
  HelperService,
  IQueueHandler,
  IQueueWorkerConfig,
  QUEUE_WORKER_CONFIG,
  QueueConsumer,
  RunnerService,
} from 'lib/nest-core'
import { PrismaService, PrismaUtil } from 'lib/nest-prisma'

@Injectable()
export class PrismaQueueConsumer extends QueueConsumer implements OnModuleInit {
  private prisma!: PrismaService
  private handlers = new Map<string, IQueueHandler>()

  // ===== Config =====
  private readonly concurrency: number
  private readonly pollIntervalMs: number
  private readonly recoveryIntervalMs: number
  private readonly workerQueue = 'consumer:queue-polling'

  // ===== Runtime state =====
  private isPolling = false
  private isRecoveryInProgress = false
  private recoveryInterval?: NodeJS.Timeout

  constructor(
    private readonly ref: ModuleRef,
    private readonly runner: RunnerService,
    private readonly helperService: HelperService,
    @Inject(QUEUE_WORKER_CONFIG) private readonly config: IQueueWorkerConfig,
  ) {
    super()

    this.concurrency = this.config.concurrency || 3
    this.pollIntervalMs = this.config.concurrency || 5000
    this.recoveryIntervalMs = this.config.recoveryIntervalMs || 60000
  }

  onModuleInit() {
    this.prisma = this.ref.get(PrismaService, { strict: false }) // trigger
  }

  register(handler: IQueueHandler): void {
    this.handlers.set(handler.topic, handler)
  }

  // @OnScope(EnumScopeType.QUEUE, { context: 'consumer', async: true })
  async start(): Promise<void> {
    if (this.isPolling) return

    this.isPolling = true

    this.startJobRecoveryLoop()
    this.startPollingLoop()
  }

  // @OnScope(EnumScopeType.QUEUE, { context: 'consumer', async: true })
  async stop(): Promise<void> {
    if (!this.isPolling) return

    this.stopJobRecoveryLoop()
    this.isPolling = false
  }

  // =========================
  // Polling loop
  // =========================
  private async startPollingLoop() {
    while (this.isPolling) {
      const start = Date.now()

      try {
        await this.pollAndRunJobs()
      } catch {}

      const elapsed = Date.now() - start
      const delayMs = Math.max(0, this.pollIntervalMs - elapsed)

      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  private async pollAndRunJobs() {
    const nowDate = this.helperService.dateNow()

    const jobs = await this.prisma.queueJob.findMany({
      where: {
        status: { in: [EnumJobStatus.PENDING, EnumJobStatus.FAILED] },
        retryCount: { lt: this.prisma.queueJob.fields.maxRetries },
        startAt: { lte: nowDate },
        lockedAt: null,
      },
      orderBy: [{ priority: 'asc' }, { startAt: 'asc' }],
      take: this.concurrency * 2,
    })

    for (const job of jobs) {
      this.runner.run(this.workerQueue, () => this.runJobWithLock(job.id), {
        concurrency: this.concurrency,
      })
    }
  }

  // =========================
  // Recovery loop
  // =========================
  private startJobRecoveryLoop() {
    if (this.recoveryInterval) return

    const jitter = Math.floor(Math.random() * 10_000)

    this.recoveryInterval = setInterval(async () => {
      if (!this.isPolling) return
      if (this.isRecoveryInProgress) return

      this.isRecoveryInProgress = true
      try {
        await this.failTimedOutRunningJobs()
      } finally {
        this.isRecoveryInProgress = false
      }
    }, this.recoveryIntervalMs + jitter)
  }

  private stopJobRecoveryLoop() {
    if (this.recoveryInterval) {
      clearInterval(this.recoveryInterval)
      this.recoveryInterval = undefined
    }
  }

  /**
   * Mark RUNNING jobs that exceeded threshold as FAILED
   */
  private async failTimedOutRunningJobs() {
    await this.prisma.queueJob.updateMany({
      where: {
        status: EnumJobStatus.RUNNING,
        lockedAt: {
          lt: this.prisma.queueJob.fields.thresholdAt,
        },
      },
      data: {
        status: EnumJobStatus.FAILED,
        lockedAt: null,
      },
      limit: this.concurrency,
    })
  }

  // =========================
  // Job execution
  // =========================

  private async runJobWithLock(jobId: number) {
    const lockResult = await this.prisma.queueJob.updateMany({
      where: {
        id: jobId,
        status: { in: [EnumJobStatus.PENDING, EnumJobStatus.FAILED] },
      },
      data: {
        status: EnumJobStatus.RUNNING,
        lockedAt: this.helperService.dateNow(),
      },
    })

    if (lockResult.count === 0) {
      return
    }

    const job = await this.prisma.queueJob.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        jobName: true,
        payload: true,
        autoDelete: true,
      },
    })
    if (!job) return

    try {
      await this.executeHandler(job.jobName, job.payload)

      if (job.autoDelete) {
        await this.prisma.queueJob.delete({ where: { id: job.id } })
      } else {
        await this.prisma.queueJob.update({
          where: { id: jobId },
          data: {
            status: EnumJobStatus.SUCCESS,
            jobHash: null,
            lastError: null,
            finishedAt: this.helperService.dateNow(),
          },
        })
      }
    } catch (error: unknown) {
      if (PrismaUtil.isNoRequiredRecord(error)) {
        return
      }

      await this.prisma.queueJob.update({
        where: { id: jobId },
        data: {
          status: EnumJobStatus.FAILED,
          retryCount: { increment: 1 },
          lockedAt: null, // for retry
          lastError: AppUtil.catchMessage(error),
          finishedAt: this.helperService.dateNow(),
        },
      })
    }
  }

  private async executeHandler(topic: string, payload: unknown): Promise<void> {
    const handler = this.handlers.get(topic)
    if (!handler) {
      throw new Error(`No QueueHandler registered for topic: ${topic}`)
    }

    await handler.handle(payload)
  }
}
