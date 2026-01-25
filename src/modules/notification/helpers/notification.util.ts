import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  EnumPushResult,
  EnumPushStatus,
  EnumPushType,
  MemberNotifyHistory,
  Prisma,
} from '@runtime/prisma-client'
import {
  AppUtil,
  DateUtil,
  EnumPushDriver,
  HelperService,
  LoggerService,
  PushFactory,
} from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { NotificationPushDto } from '../dtos'
import { TPush } from '../interfaces'

@Injectable()
export class NotificationUtil {
  private drivers: string[]

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly helperService: HelperService,
    private readonly pushFactory: PushFactory,
  ) {
    const _drivers = this.config.getOrThrow('push.drivers')
    this.drivers = Object.keys(_drivers)
  }

  async getPendingPushes(limit?: number): Promise<TPush[]> {
    return await this.prisma.push.findMany({
      where: {
        isActive: true,
        status: EnumPushStatus.PENDING,
        retryCount: { lt: this.prisma.push.fields.maxRetries },
      },
      take: limit,
    })
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
      data: { status: EnumPushStatus.PUSHING },
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
      id: pushId,
      status: {
        in: [EnumPushStatus.COMPLETED, EnumPushStatus.CANCELED],
      },
    })
  }

  async dispatchPushData(
    history: MemberNotifyHistory,
    options: { token: string; drivers: EnumPushDriver[] },
  ): Promise<void> {
    for (const driver of options.drivers) {
      try {
        await this.pushFactory.getDriver(driver).send({
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
    payload: Prisma.MemberNotifyHistoryUncheckedCreateInput,
    drivers: EnumPushDriver[],
  ): Promise<void> {
    const memberDevices = await this.prisma.memberDeviceHistory.findMany({
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
        const [history] = await this.prisma.$transaction([
          this.prisma.memberNotifyHistory.create({
            data: { ...payload, pushedAt: nowDate },
          }),
          this.prisma.memberPushHistory.create({
            data: {
              deviceToken,
              memberId: payload.memberId,
              status: EnumPushResult.SENT,
              pushId: payload.pushId,
              pushedAt: nowDate,
            },
          }),
        ])

        await this.dispatchPushData(history, { token: deviceToken, drivers })
      } else {
        const history = await this.prisma.memberNotifyHistory.create({
          data: { ...payload, pushedAt: nowDate },
        })

        await this.dispatchPushData(history, { token: deviceToken, drivers })
      }
    }
  }

  async getPushData(
    memberId: number,
    pushId: number,
  ): Promise<Prisma.MemberNotifyHistoryUncheckedCreateInput> {
    const push = await this.prisma.push.findUnique({
      where: { id: pushId, status: EnumPushStatus.PUSHING },
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

    const pushTitle = push.notification.title[member.locale]
    const pushContent = push.notification.description[member.locale]
    if (!pushTitle || !pushContent) {
      throw new Error(`Push content is invalid`)
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
        deviceHistories: {
          some: { isActive: true },
        },
        pushHistories: {
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

  static isInstant(type: EnumPushType): boolean {
    return EnumPushType.INSTANT === type
  }

  static isSpecDate(type: EnumPushType): boolean {
    return EnumPushType.DATETIME === type
  }

  static isLoop(type: EnumPushType): boolean {
    return (
      EnumPushType.DAILY === type ||
      EnumPushType.WEEKLY === type ||
      EnumPushType.MONTHLY === type ||
      EnumPushType.YEARLY === type
    )
  }

  static isOnce(type: EnumPushType): boolean {
    return EnumPushType.INSTANT === type || EnumPushType.DATETIME === type
  }

  private static getScheduledDate(dto: NotificationPushDto): Date {
    if (dto.type === EnumPushType.INSTANT) {
      return new Date()
    }
    if (dto.type === EnumPushType.DATETIME) {
      return DateUtil.mergeDate(dto.executeDate, dto.executeTime)
    }
    return DateUtil.mergeDate(dto.startDate, dto.executeTime)
  }

  static makeDto(dto: NotificationPushDto): Prisma.PushCreateManyNotificationInput {
    const dateSchedule = this.getScheduledDate(dto)
    const dateExtract = DateUtil.extractDate(dateSchedule)

    return {
      ...dto,
      hour: dateExtract.hour,
      minute: dateExtract.minute,
      second: dateExtract.second,
      startAt: dateExtract.date,
    }
  }

  static makeDtos(dtos: NotificationPushDto[]): Prisma.PushCreateManyNotificationInput[] {
    return dtos.map(dto => this.makeDto(dto))
  }
}
