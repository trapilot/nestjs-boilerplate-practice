import { EnumPushResult, EnumPushStatus, MemberNotification, Prisma } from '@runtime/prisma-client'
import {
  APP_LANGUAGE,
  EnumPushDriver,
  HelperService,
  LoggerService,
  PushDispatcher,
} from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'

export class NotificationSendPushWorkflow {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly helperService: HelperService,
    private readonly pushDispatcher: PushDispatcher,
  ) {}

  async execute(
    pushId: number,
    options: { memberId: number; drivers: EnumPushDriver[] },
  ): Promise<void> {
    const data = await this.getPushData(options.memberId, pushId)

    await this.sendPushData(data, options.drivers)
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
