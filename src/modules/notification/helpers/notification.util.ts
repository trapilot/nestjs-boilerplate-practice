import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  EnumPushResult,
  EnumPushStatus,
  EnumPushType,
  MemberNotification,
  Prisma,
} from '@runtime/prisma-client'
import {
  APP_LANGUAGE,
  AppUtil,
  DateUtil,
  EnumPushDriver,
  EnumQueuePriority,
  HelperService,
  LoggerService,
  PushDispatcher,
  QueueProducer,
} from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { NotificationPushDto } from '../dtos/notification.request.create.dto'
import { EnumNotificationQueue } from '../enums/notification.enum'
import { TPush } from '../interfaces/notification.interface'
import { INotificationDispatchPushPayload } from '../interfaces/notification.queue.interface'

@Injectable()
export class NotificationUtil {
  private drivers: string[]

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly producer: QueueProducer,
    private readonly helperService: HelperService,
    private readonly pushDispatcher: PushDispatcher,
  ) {
    this.drivers = Object.keys(this.config.getOrThrow('push.drivers'))
  }

  async getPush(pushId: number, include: Prisma.PushInclude = undefined): Promise<TPush> {
    return await this.prisma.push.findUnique({
      where: { id: pushId },
      include,
    })
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

  async validatePushCanRun(pushId: number): Promise<boolean> {
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

  async dispatchPush(pushId: number) {
    // try {
    //   await this.validatePushCanRun(pushId)
    // } catch (error: unknown) {
    //   await this.cancelPush(pushId)
    // }

    try {
      await this.validatePushCanRun(pushId)

      await this.producer.publish<INotificationDispatchPushPayload>(
        EnumNotificationQueue.PUSH_DISPATCH,
        {
          version: 1,
          priority: EnumQueuePriority.LOW,
          startDate: this.helperService.dateNow(),
          message: {
            pushId,
          },
        },
      )

      await this.lockPush(pushId)
    } catch (error: unknown) {
      await this.handlePushFailure(pushId, error)
    }
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

  async dispatchPushToMember(memberId: number, pushId: number): Promise<void> {
    const data = await this.getPushData(memberId, pushId)

    await this.sendPushData(data, [EnumPushDriver.ONESIGNAL])
  }

  static canWeekday(type: EnumPushType): boolean {
    return EnumPushType.DAILY === type
  }

  static canDay(type: EnumPushType): boolean {
    return EnumPushType.MONTHLY === type || EnumPushType.YEARLY === type
  }

  static canMonth(type: EnumPushType): boolean {
    return EnumPushType.YEARLY === type
  }

  static isOnce(type: EnumPushType): boolean {
    return EnumPushType.ONCE === type
  }

  static isLoop(type: EnumPushType): boolean {
    return (
      EnumPushType.DAILY === type ||
      EnumPushType.WEEKLY === type ||
      EnumPushType.MONTHLY === type ||
      EnumPushType.YEARLY === type
    )
  }

  static makeDto(dto: NotificationPushDto): Prisma.PushCreateManyNotificationInput {
    const { executeDate, executeTime, sinceDate, ...data } = dto
    const dateSchedule =
      dto.type === EnumPushType.ONCE
        ? DateUtil.mergeDate(executeDate, executeTime)
        : DateUtil.mergeDate(sinceDate, executeTime)
    const dateExtract = DateUtil.extractDate(dateSchedule)

    return {
      ...data,
      sinceDate,
      hour: dateExtract.hour,
      minute: dateExtract.minute,
      second: dateExtract.second,
      startAt: dateExtract.date,
    }
  }

  static makeDtos(dtos: NotificationPushDto[]): Prisma.PushCreateManyNotificationInput[] {
    return dtos.map(dto => this.makeDto(dto))
  }

  async handlePushFailure(pushId: number, error: unknown) {
    const push = await this.getPush(pushId)

    if (push.retryCount < push.maxRetries) {
      await this.retryPush(pushId)
    } else {
      await this.cancelPush(pushId, error)
    }
  }
}
