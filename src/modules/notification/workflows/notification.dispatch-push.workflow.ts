import { EnumPushStatus, Prisma } from '@runtime/prisma-client'
import { AppUtil, EnumQueuePriority, HelperService, QueueProducer } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { EnumNotificationQueue } from '../enums/notification.enum'
import { TPush } from '../interfaces/notification.interface'
import { INotificationDispatchPushPayload } from '../interfaces/notification.queue.interface'

export class NotificationDispatchPushWorkflow {
  constructor(
    private readonly prisma: PrismaService,
    private readonly producer: QueueProducer,
    private readonly helperService: HelperService,
  ) {}

  async execute(): Promise<void> {
    const pushes = await this.getPendingPushes(2)

    for (const push of pushes) {
      await this.dispatchPush(push)
    }
  }

  async getPush(pushId: number, include?: Prisma.PushInclude): Promise<TPush> {
    return await this.prisma.push.findUnique({
      where: { id: pushId },
      include,
    })
  }

  async getPendingPushes(limit: number = 1): Promise<TPush[]> {
    return await this.prisma.push.findMany({
      where: {
        isActive: true,
        status: EnumPushStatus.PENDING,
        retryCount: { lt: this.prisma.push.fields.maxRetries },
      },
      take: limit,
      orderBy: [{ startAt: 'asc' }],
    })
  }

  private async dispatchPush(push: TPush) {
    try {
      await this.validatePushCanRun(push.id)

      await this.dispatchAndLock(push)
    } catch (error: unknown) {
      await this.cancelPush(push.id, error)
    }
  }

  private async dispatchAndLock(push: TPush): Promise<void> {
    try {
      await this.producer.publish<INotificationDispatchPushPayload>(
        EnumNotificationQueue.PUSH_DISPATCH,
        {
          version: 1,
          priority: EnumQueuePriority.LOW,
          startDate: this.helperService.dateNow(),
          message: {
            pushId: push.id,
          },
        },
      )

      await this.lockPush(push.id)
    } catch (error: unknown) {
      if (push.retryCount < push.maxRetries) {
        await this.retryPush(push.id)
      }
      throw error
    }
  }

  private async validatePushCanRun(pushId: number): Promise<boolean> {
    const push = await this.getPush(pushId, { notification: true })

    if (push.status !== EnumPushStatus.PENDING) {
      throw new Error(`Error: push status is not pending, STATUS=${push.status}`)
    }

    const { isActive, title, description } = push.notification
    if (!isActive) {
      throw new Error(`Error: notification is deactivated`)
    }
    if (!title) {
      throw new Error(`Error: notification title didn't set`)
    }
    if (!description) {
      throw new Error(`Error: notification description didn't set`)
    }

    return true
  }

  async cancelPush(pushId: number, error?: unknown): Promise<boolean> {
    await this.prisma.push.update({
      where: { id: pushId },
      data: {
        status: EnumPushStatus.CANCELED,
        lastError: AppUtil.catchMessage(error),
      },
    })
    return true
  }

  async lockPush(pushId: number): Promise<boolean> {
    await this.prisma.push.update({
      where: { id: pushId, status: EnumPushStatus.PENDING },
      data: { status: EnumPushStatus.RUNNING },
    })
    return true
  }

  async retryPush(pushId: number): Promise<boolean> {
    await this.prisma.push.update({
      where: { id: pushId },
      data: { retryCount: { increment: 1 } },
    })
    return true
  }

  async deliveredPush(pushId: number): Promise<boolean> {
    await this.prisma.push.update({
      where: { id: pushId },
      data: { status: EnumPushStatus.COMPLETED },
    })
    return true
  }
}
