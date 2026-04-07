import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { EnumJobStatus, QueueJob } from '@runtime/prisma-client'
import {
  AppUtil,
  HelperService,
  IWorkerConfig,
  IWorkerHandler,
  RunnerService,
  WORKER_CONFIG,
  WorkerConsumer,
} from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'

@Injectable()
export class PrismaWorkerConsumer extends WorkerConsumer implements OnModuleInit {
  private prisma!: PrismaService
  private handlers = new Map<string, IWorkerHandler>()
  private runningJobIds = new Set<number>()

  // ===== Config =====
  private readonly concurrency: number
  private readonly pollIntervalMs: number
  private readonly archiveIntervalMs: number
  private readonly recoveryIntervalMs: number
  private readonly heartbeatIntervalMs: number
  private readonly heartbeatTimeoutMs: number
  private readonly workerId = `worker-${process.pid}`
  private readonly workerQueue = 'queue:consumer-polling'

  // ===== Runtime state =====
  private isPolling = false
  private isArchiveInProgress = false
  private isRecoveryInProgress = false
  private archiveInterval?: NodeJS.Timeout
  private recoveryInterval?: NodeJS.Timeout
  private heartbeatInterval?: NodeJS.Timeout

  constructor(
    private readonly ref: ModuleRef,
    private readonly runner: RunnerService,
    private readonly helperService: HelperService,
    @Inject(WORKER_CONFIG) private readonly config: IWorkerConfig,
  ) {
    super()

    this.concurrency = this.config.concurrency || 3
    this.pollIntervalMs = this.config.pollIntervalMs || 5000
    this.archiveIntervalMs = this.config.archiveIntervalMs || 60000
    this.recoveryIntervalMs = this.config.recoveryIntervalMs || 60000
    this.heartbeatIntervalMs = this.config.heartbeatIntervalMs || 5000

    // Adaptive timeout = 3 × heartbeatInterval
    this.heartbeatTimeoutMs = this.heartbeatIntervalMs * 3
  }

  onModuleInit() {
    this.prisma = this.ref.get(PrismaService, { strict: false }) // trigger
  }

  register(handler: IWorkerHandler): void {
    this.handlers.set(handler.topic, handler)
  }

  async start(): Promise<void> {
    if (this.isPolling) return

    this.isPolling = true

    this.startJobRecoveryLoop()
    this.startJobArchiveLoop()
    this.startHeartbeatLoop()
    this.startPollingLoop()
  }

  async stop(): Promise<void> {
    if (!this.isPolling) return

    this.stopJobRecoveryLoop()
    this.stopJobArchiveLoop()
    this.stopHeartbeatLoop()
    this.stopPollingLoop()

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
      } catch (err: unknown) {
        console.log({ startPollingLoop: err })
      }

      const elapsed = Date.now() - start
      const delayMs = Math.max(100, this.pollIntervalMs - elapsed)

      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  private async stopPollingLoop() {
    await this.runner.waitForIdle(this.workerQueue)
  }

  private async pollAndRunJobs(skipLocked: boolean = false) {
    const jobIds = skipLocked ? await this.safePollAndLockBatch() : await this.pollAndLockBatch()

    for (const jobId of jobIds) {
      this.runner.run(this.workerQueue, () => this.processJob(jobId), {
        concurrency: this.concurrency,
      })
    }
  }

  private async pollAndLockBatch() {
    const nowDate = this.helperService.dateNow()

    return this.prisma.$transaction(async tx => {
      const jobs = await tx.queueJob.findMany({
        where: {
          status: EnumJobStatus.PENDING,
          retryCount: { lt: tx.queueJob.fields.maxRetries },
          startAt: { lte: nowDate },
          lockedAt: null,
        },
        orderBy: [{ priority: 'asc' }, { startAt: 'asc' }],
        take: this.concurrency,
        select: { id: true },
      })

      if (!jobs.length) return []

      const jobIds = jobs.map(j => j.id)

      const result = await tx.queueJob.updateMany({
        where: {
          id: { in: jobIds },
          lockedAt: null,
        },
        data: {
          status: EnumJobStatus.RUNNING,
          heartbeatAt: nowDate,
          lockedAt: nowDate,
          lockedBy: this.workerId,
        },
      })

      if (result.count !== jobIds.length) {
        return []
      }

      return jobIds
    })
  }

  async safePollAndLockBatch() {
    const nowDate = this.helperService.dateNow()

    const jobs = await this.prisma.$queryRaw<{ id: number }[]>`
      SELECT id
      FROM queue_jobs
      WHERE status = "${EnumJobStatus.PENDING}"
        AND "startAt" <= ${nowDate}
        AND "retryCount" < "maxRetries"
        AND "lockedAt" IS NULL
      ORDER BY priority ASC, "startAt" ASC
      FOR UPDATE SKIP LOCKED
      LIMIT ${this.concurrency}`

    if (!jobs.length) return []

    const jobIds = jobs.map(j => j.id)

    await this.prisma.queueJob.updateMany({
      where: { id: { in: jobIds } },
      data: {
        status: EnumJobStatus.RUNNING,
        lockedAt: nowDate,
        lockedBy: this.workerId,
      },
    })

    return jobIds
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
        await this.recoverStaleRunningJobs()
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

  // =========================
  // Heartbeat loop
  // =========================

  private startHeartbeatLoop() {
    if (this.heartbeatInterval) return

    this.heartbeatInterval = setInterval(async () => {
      if (!this.runningJobIds.size) return

      await this.prisma.queueJob.updateMany({
        where: {
          id: { in: [...this.runningJobIds] },
          lockedBy: this.workerId,
          status: EnumJobStatus.RUNNING,
        },
        data: {
          heartbeatAt: this.helperService.dateNow(),
        },
      })
    }, this.heartbeatIntervalMs)
  }

  private stopHeartbeatLoop() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = undefined
    }
  }

  // =========================
  // Archive loop
  // =========================
  private startJobArchiveLoop() {
    if (this.archiveInterval) return

    const jitter = Math.floor(Math.random() * 10_000)

    this.archiveInterval = setInterval(async () => {
      if (!this.isPolling) return
      if (this.isArchiveInProgress) return

      this.isArchiveInProgress = true
      try {
        await this.archiveFailedJobs()
      } finally {
        this.isArchiveInProgress = false
      }
    }, this.archiveIntervalMs + jitter)
  }

  private stopJobArchiveLoop() {
    if (this.archiveInterval) {
      clearInterval(this.archiveInterval)
      this.archiveInterval = undefined
    }
  }

  /**
   * Mark RUNNING jobs that exceeded threshold as FAILED
   */
  private async failTimedOutRunningJobs() {
    const nowDate = this.helperService.dateNow()

    await this.prisma.queueJob.updateMany({
      where: {
        status: EnumJobStatus.RUNNING,
        thresholdAt: { lt: nowDate },
        lockedBy: { not: null },
      },
      data: {
        status: EnumJobStatus.FAILED,
        lockedAt: null,
        lockedBy: null,
        heartbeatAt: null,
        lastError: 'Job exceeded threshold time',
      },
    })
  }

  /**
   * Mark RUNNING jobs that exceeded staleTime as PENDING
   */
  private async recoverStaleRunningJobs() {
    const nowDate = this.helperService.dateNow()
    const staleTime = this.helperService.dateBackward(nowDate, {
      millisecond: this.heartbeatTimeoutMs,
    })

    await this.prisma.queueJob.updateMany({
      where: {
        status: EnumJobStatus.RUNNING,
        heartbeatAt: { lt: staleTime },
        lockedBy: { not: this.workerId },
      },
      data: {
        status: EnumJobStatus.PENDING,
        lockedAt: null,
        lockedBy: null,
        heartbeatAt: null,
      },
    })
  }

  /**
   * Archive FAILED jobs
   */
  private async archiveFailedJobs(batchSize: number = 200) {
    await this.prisma.$transaction(async tx => {
      const jobs = await tx.queueJob.findMany({
        where: {
          status: EnumJobStatus.FAILED,
        },
        take: batchSize,
        orderBy: { id: 'asc' },
      })

      if (!jobs.length) return

      await tx.queueJobFailure.createMany({
        data: jobs.map(job => ({
          originalId: job.id,
          jobName: job.jobName,
          payload: job.payload,
          retryCount: job.retryCount,
          lastError: job.lastError,
        })),
      })

      await tx.queueJob.deleteMany({
        where: { id: { in: jobs.map(j => j.id) } },
      })
    })
  }

  // =========================
  // Job execution
  // =========================

  private async processJob(jobId: number) {
    const job = await this.prisma.queueJob.findUnique({
      where: {
        id: jobId,
        lockedBy: this.workerId,
      },
    })

    if (!job) {
      this.runningJobIds.delete(jobId)
      return
    }

    try {
      await this.executeHandler(job.version, job.jobName, job.payload)

      await this.completeJob(job)
    } catch (error: unknown) {
      await this.failJob(job, error)
    } finally {
      this.runningJobIds.delete(jobId)
    }
  }

  private async executeHandler(version: number, topic: string, payload: unknown): Promise<void> {
    const handler = this.handlers.get(topic)
    if (!handler) {
      throw new Error(`No QueueHandler registered for topic: ${topic}`)
    }

    await handler.handle(version, payload)
  }

  private async completeJob(job: QueueJob) {
    await this.prisma.$transaction(async tx => {
      if (job.persistent) {
        await tx.queueJobArchive.create({
          data: {
            originalId: job.id,
            jobName: job.jobName,
            payload: job.payload,
            retryCount: job.retryCount,
          },
        })
      }

      await tx.queueJob.delete({
        where: { id: job.id },
      })
    })
  }

  private async failJob(job: QueueJob, error: unknown) {
    if (job.retryCount + 1 >= job.maxRetries) {
      await this.prisma.$transaction(async tx => {
        await tx.queueJobFailure.create({
          data: {
            originalId: job.id,
            jobName: job.jobName,
            payload: job.payload,
            retryCount: job.retryCount + 1,
            lastError: AppUtil.catchMessage(error),
          },
        })

        await tx.queueJob.delete({
          where: { id: job.id },
        })
      })

      return
    }

    const nowDate = this.helperService.dateNow()
    const runDate = this.helperService.dateForward(nowDate, {
      second: 5,
    })

    await this.prisma.queueJob.update({
      where: { id: job.id },
      data: {
        status: EnumJobStatus.PENDING,
        retryCount: { increment: 1 },
        lockedAt: null,
        lockedBy: null,
        lastError: AppUtil.catchMessage(error),
        startAt: runDate,
      },
    })
  }
}
