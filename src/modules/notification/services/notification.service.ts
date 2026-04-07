import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { EnumPushResult, EnumPushStatus, MemberNotification, Prisma } from '@runtime/prisma-client'
import {
  APP_LANGUAGE,
  AppUtil,
  EnumPushDriver,
  EnumQueuePriority,
  HelperService,
  LoggerService,
  PushDispatcher,
  WorkerProducer,
} from 'lib/nest-core'
import {
  IPrismaExportOptions,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { NOTIFICATION_QUEUE_PROC_VERSION } from '../constants/notification.constant'
import { EnumNotificationQueue } from '../enums/notification.enum'
import { TNotification, TPush } from '../interfaces/notification.interface'
import { INotificationDispatchPushPayload } from '../interfaces/notification.queue.interface'

@Injectable()
export class NotificationService {
  constructor(
    private readonly logger: LoggerService,
    private readonly prisma: PrismaService,
    private readonly producer: WorkerProducer,
    private readonly helperService: HelperService,
    private readonly pushDispatcher: PushDispatcher,
  ) {}

  async getOne(kwargs: Prisma.NotificationFindUniqueArgs): Promise<TNotification> {
    return await this.prisma.notification.findUnique(kwargs)
  }

  async getFirst(kwargs?: Prisma.NotificationFindFirstArgs): Promise<TNotification> {
    return await this.prisma.notification.findFirst(kwargs)
  }

  async getMany(kwargs?: Prisma.NotificationFindManyArgs): Promise<TNotification[]> {
    return await this.prisma.notification.findMany(kwargs)
  }

  async getList(
    kwargs: Prisma.NotificationFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.notification.list(kwargs, options)
  }

  async getPage(
    kwargs: Prisma.NotificationFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.notification.paginate(kwargs, options)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.NotificationFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TNotification> {
    return await this.prisma.notification
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.notification.notFound',
        })
      })
  }

  async create(data: Prisma.NotificationUncheckedCreateInput): Promise<TNotification> {
    const notification = await this.prisma.notification.create({
      data,
    })
    return notification
  }

  async update(id: number, data: Prisma.NotificationUncheckedUpdateInput): Promise<TNotification> {
    const notification = await this.findOrFail(id)

    return await this.prisma.notification.update({
      data,
      where: { id: notification.id },
    })
  }

  async delete(id: number, _deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async tx => {
        await tx.notification.delete({ where: { id } })
      })
      return true
    } catch {
      return false
    }
  }

  async inactive(id: number): Promise<TNotification> {
    const notification = await this.findOrFail(id)
    return await this.prisma.notification.update({
      data: { isActive: false },
      where: { id: notification.id },
    })
  }

  async active(id: number): Promise<TNotification> {
    const notification = await this.findOrFail(id)
    return await this.prisma.notification.update({
      data: { isActive: true },
      where: { id: notification.id },
    })
  }

  async getUnsentPushMembers(
    pushId: number,
    cursor: { lastId: number; size: number },
  ): Promise<number[]> {
    const members = await this.prisma.member.findMany({
      where: {
        isActive: true,
        isPhoneVerified: true,
        // devices: {
        //   some: { isActive: true },
        // },
        pushes: {
          none: { pushId },
        },
      },
      cursor: cursor.lastId ? { id: cursor.lastId } : undefined,
      skip: cursor.lastId ? 1 : 0,
      select: { id: true },
      take: cursor.size,
    })
    return members.map(i => i.id)
  }

  async isPushRunning(pushId: number): Promise<boolean> {
    const push = await this.prisma.push.findUnique({
      where: { id: pushId },
      select: { status: true },
    })
    return push?.status !== EnumPushStatus.PENDING
  }

  async isPushFinished(pushId: number): Promise<boolean> {
    return await this.prisma.push.exists({
      where: {
        id: pushId,
        status: {
          in: [EnumPushStatus.COMPLETED, EnumPushStatus.CANCELED],
        },
      },
    })
  }

  async dispatchPushToMember(memberId: number, pushId: number): Promise<void> {
    const data = await this.getPushData(memberId, pushId)

    await this.sendPushData(data, [EnumPushDriver.ONESIGNAL])
  }

  async enqueueScanPendingPush(options: { startDate: Date }): Promise<void> {
    const pushes = await this.getPendingPushes(2)

    for (const push of pushes) {
      try {
        await this.validatePushCanRun(push.id)

        // add to queue
        await this.producer.publish<INotificationDispatchPushPayload>(
          EnumNotificationQueue.PUSH_DISPATCH,
          {
            version: NOTIFICATION_QUEUE_PROC_VERSION[EnumNotificationQueue.PUSH_DISPATCH],
            priority: EnumQueuePriority.LOW,
            startDate: options.startDate,
            message: {
              pushId: push.id,
            },
          },
        )

        // lock after published
        await this.lockPush(push.id)
      } catch (err: unknown) {
        if (push.retryCount < push.maxRetries) {
          await this.retryPush(push.id)
        } else {
          await this.cancelPush(push.id)
        }
        this.logger.log(err)
      }
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

  async dispatchPushData(
    history: MemberNotification,
    options: { token: string; drivers: EnumPushDriver[] },
  ): Promise<void> {
    for (const driver of options.drivers) {
      try {
        await this.pushDispatcher.dispatchAsync(driver, {
          token: options.token,
          title: history.title,
          body: history.body,
          data: {
            id: history.refId,
            type: history.refType,
            rawId: history.id,
          },
        })
      } catch (err: unknown) {
        this.logger.error(err)
      }
    }
  }

  async sendPushData(
    payload: Prisma.MemberNotificationUncheckedCreateInput,
    drivers: EnumPushDriver[],
  ): Promise<void> {
    const memberDevices = await this.prisma.memberDevice.findMany({
      where: { memberId: payload.memberId, isActive: true },
      select: { token: true },
    })

    const deviceTokens = memberDevices.map(i => i.token).filter(i => i)
    if (!deviceTokens.length) {
      throw new Error(`No device tokens available`)
    }

    for (const deviceToken of deviceTokens) {
      const nowDate = this.helperService.dateNow()
      if (payload?.pushId) {
        const [inbox] = await this.prisma.$transaction([
          this.prisma.memberNotification.create({
            data: { ...payload, pushedAt: nowDate },
          }),
          this.prisma.memberPush.create({
            data: {
              deviceToken,
              memberId: payload.memberId,
              status: EnumPushResult.SENT,
              pushId: payload.pushId,
              pushedAt: nowDate,
            },
          }),
        ])

        await this.dispatchPushData(inbox, { token: deviceToken, drivers })
      } else {
        const inbox = await this.prisma.memberNotification.create({
          data: { ...payload, pushedAt: nowDate },
        })

        await this.dispatchPushData(inbox, { token: deviceToken, drivers })
      }
    }
  }

  async getPushData(
    memberId: number,
    pushId: number,
  ): Promise<Prisma.MemberNotificationUncheckedCreateInput> {
    const push = await this.prisma.push.findUnique({
      where: { id: pushId, status: EnumPushStatus.RUNNING },
      select: {
        id: true,
        notification: true,
      },
    })

    if (!push) {
      throw new Error(`Push is finished`)
    }

    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      select: { id: true, locale: true },
    })

    const title = push.notification.title
    const description = push.notification.description

    const pushTitle = title[member.locale] || title[APP_LANGUAGE]
    if (!pushTitle) {
      throw new Error(`[${member.locale}] Push title is invalid`)
    }

    const pushContent = description[member.locale] || description[APP_LANGUAGE]
    if (!pushContent) {
      throw new Error(`[${member.locale}] Push content is invalid`)
    }

    return {
      memberId,
      pushId: push.id,
      notificationId: push.notification.id,
      title: pushTitle,
      body: pushContent,
      refId: push.notification.refId,
      refType: push.notification.refType,
    }
  }
}
