import { ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { ENUM_PUSH_STATUS, ENUM_PUSH_TYPE, Notification, Prisma } from '@prisma/client'
import { DateService, ENUM_DATE_FORMAT, HelperService, MESSAGE_LANGUAGES } from 'lib/nest-core'
import { LoggerService } from 'lib/nest-logger'
import { NotifierService } from 'lib/nest-notifier'
import { IPrismaOptions, IPrismaParams, PrismaService } from 'lib/nest-prisma'
import { IResponseList, IResponsePaging } from 'lib/nest-web'
import { IPushHistoryData, IPushMessageData, TPush } from '../interfaces'

@Injectable()
export class PushService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifier: NotifierService,
    private readonly dateService: DateService,
    private readonly helperService: HelperService,
  ) {}

  async findOne(kwargs?: Prisma.PushFindUniqueArgs): Promise<TPush> {
    return await this.prisma.push.findUnique(kwargs)
  }

  async findFirst(kwargs: Prisma.PushFindFirstArgs = {}): Promise<TPush> {
    return await this.prisma.push.findFirst(kwargs)
  }

  async findAll(kwargs: Prisma.PushFindManyArgs = {}): Promise<TPush[]> {
    return await this.prisma.push.findMany(kwargs)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.PushFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TPush> {
    const push = await this.prisma.push
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.push.notFound',
        })
      })
    return push
  }

  async differOrFail(
    where: Prisma.PushWhereInput,
    options?: { limit?: number; message?: string },
  ): Promise<void> {
    const totalRecords = await this.count(where)
    const limitRecords = options?.limit ?? 0
    if (totalRecords > limitRecords) {
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: options?.message ?? 'module.push.conflict',
      })
    }
  }

  async matchOrFail(
    where: Prisma.PushWhereInput,
    kwargs: Omit<Prisma.PushFindFirstOrThrowArgs, 'where'> = {},
  ): Promise<TPush> {
    const push = await this.prisma.push
      .findFirstOrThrow({ ...kwargs, where })
      .catch((err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.push.notFound',
        })
      })
    return push
  }

  async list(
    where?: Prisma.PushWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponseList> {
    return await this.prisma.$extension(async (ex) => {
      return await ex.push.list(where, params, options)
    })
  }

  async paginate(
    where?: Prisma.PushWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponsePaging> {
    return await this.prisma.$extension(async (ex) => {
      return await ex.push.paginate(where, params, options)
    })
  }

  async count(where?: Prisma.PushWhereInput): Promise<number> {
    return await this.prisma.push.count({
      where,
    })
  }

  async find(id: number, kwargs: Omit<Prisma.PushFindUniqueArgs, 'where'> = {}): Promise<TPush> {
    return await this.prisma.push.findUnique({
      ...kwargs,
      where: { id },
    })
  }

  async create(data: Prisma.PushUncheckedCreateInput): Promise<TPush> {
    const push = await this.prisma.push.create({
      data,
    })
    return push
  }

  async update(id: number, data: Prisma.PushUncheckedUpdateInput): Promise<TPush> {
    const push = await this.findOrFail(id)

    return await this.prisma.push.update({
      data,
      where: { id: push.id },
    })
  }

  async delete(push: TPush, deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.push.delete({ where: { id: push.id } })
      })
      return true
    } catch {
      return false
    }
  }

  async inactive(id: number): Promise<TPush> {
    const push = await this.findOrFail(id)
    return await this.prisma.push.update({
      data: { isActive: false },
      where: { id: push.id },
    })
  }

  async active(id: number): Promise<TPush> {
    const push = await this.findOrFail(id)
    return await this.prisma.push.update({
      data: { isActive: true },
      where: { id: push.id },
    })
  }

  async getPushing(): Promise<TPush> {
    return await this.findFirst({
      where: {
        status: ENUM_PUSH_STATUS.PUSHING,
        isActive: true,
      },
    })
  }

  async getPending(): Promise<TPush> {
    const dateNow = this.dateService.create()
    const dateExtract = this.dateService.extract(dateNow)

    const currentDate = dateExtract.date
    const currentTime = this.dateService.format(dateExtract.date, ENUM_DATE_FORMAT.DURATION_LONG)

    const _where: Prisma.PushWhereInput = {
      isActive: true,
      scheduledAt: { lte: currentDate },
      notification: { isActive: true },
    }

    const _kwargs: Prisma.PushFindFirstArgs = {
      include: { notification: { include: { pivotGroups: true } } },
      orderBy: [{ scheduledAt: 'asc' }],
    }

    // instant
    const instant = await this.findFirst({
      ..._kwargs,
      where: {
        ..._where,
        type: ENUM_PUSH_TYPE.INSTANT,
        status: ENUM_PUSH_STATUS.PENDING,
      },
    })
    if (instant) return instant

    // special date time
    const specialDateRule = await this.findFirst({
      ..._kwargs,
      where: {
        ..._where,
        type: ENUM_PUSH_TYPE.DATETIME,
        status: ENUM_PUSH_STATUS.PENDING,
      },
    })
    if (specialDateRule) return specialDateRule

    // other rule
    return await this.findFirst({
      ..._kwargs,
      where: {
        ..._where,
        type: {
          in: [
            ENUM_PUSH_TYPE.DAILY,
            ENUM_PUSH_TYPE.WEEKLY,
            ENUM_PUSH_TYPE.MONTHLY,
            ENUM_PUSH_TYPE.YEARLY,
          ],
        },
        hours: { lte: dateExtract.hour },
        minutes: { lte: dateExtract.minute },
        seconds: { lte: dateExtract.second },
        AND: [
          { OR: [{ startDate: null }, { startDate: { lte: currentDate } }] },
          { OR: [{ untilDate: null }, { untilDate: { gte: currentDate } }] },
          { OR: [{ weekday: null }, { weekday: dateExtract.weekday }] },
          { OR: [{ month: null }, { month: dateExtract.month }] },
          { OR: [{ day: null }, { day: dateExtract.day }] },
        ],
      },
    })
  }

  private async getNotificationRef(notification: Notification): Promise<any> {}

  private async getNotificationMembers(push: TPush): Promise<any> {
    let totalDevice = 0
    const memberPushes: { id: number; locale: string; isNotifiable: boolean }[] = []
    const memberNotifications: { memberId: number; refId: number; refType: string }[] = []

    const whereORs: Prisma.MemberWhereInput = { OR: [] }
    if (push?.pivotGroups?.length) {
      for (const pivotGroups of push.pivotGroups) {
        const group = await this.prisma.pushGroup.findUnique({
          where: { id: pivotGroups.groupId },
        })
        const whereAnd: Prisma.MemberWhereInput = {}
        if (group.joinSinceDate) {
          whereAnd.createdAt = { gte: group.joinSinceDate }
        }
        if (group.joinUntilDate) {
          whereAnd.createdAt = { lte: group.joinUntilDate }
        }

        if (Array.isArray(group.emails)) {
          whereAnd.email = { in: group.emails as string[] }
        }
        if (Array.isArray(group.tierIds)) {
          whereAnd.tierId = { in: group.tierIds as number[] }
        }
        if (Array.isArray(group.phones)) {
          whereAnd.phone = { in: group.phones as string[] }
        }

        if (Object.keys(whereAnd).length) {
          whereORs.OR.push(whereAnd)
        }
      }
    }

    const memberWithDevices = await this.prisma.member.findMany({
      where: { isActive: true, isDeleted: false, isPhoneVerified: true, AND: whereORs },
      select: {
        id: true,
        locale: true,
        isNotifiable: true,
        deviceHistories: {
          where: { isActive: true },
          select: { token: true },
        },
      },
    })

    for (const member of memberWithDevices) {
      totalDevice += member.deviceHistories.length
      memberPushes.push({
        id: member.id,
        locale: member.locale,
        isNotifiable: member.isNotifiable,
      })
      memberNotifications.push({
        memberId: member.id,
        refId: push.notification.refId,
        refType: push.notification.type,
      })
    }

    return {
      totalDevice,
      memberPushes,
      memberNotifications,
    }
  }

  private async pushing(push: TPush, logger: LoggerService): Promise<TPush> {
    logger.info(`Pushing: #${push.id}`)

    const isValid = await this.validate(push)
    if (!isValid) {
      logger.info(`Error: Invalid data`)
      return await this.skip(push, logger)
    }

    const dateNow = this.dateService.create()
    const expiresAt = this.dateService.forward(push.untilDate || dateNow, {
      minutes: 5,
    })

    let scheduledAt = this.dateService.set(push.scheduledAt, {
      hour: push.hours,
      minute: push.minutes,
      second: push.seconds,
      millisecond: 0,
    })

    switch (push.type) {
      case ENUM_PUSH_TYPE.DAILY:
        scheduledAt = this.dateService.forward(push.scheduledAt, { days: 1 })
        break
      case ENUM_PUSH_TYPE.WEEKLY:
        scheduledAt = this.dateService.forward(push.scheduledAt, { days: 7 })
        break
      case ENUM_PUSH_TYPE.MONTHLY:
        scheduledAt = this.dateService.forward(push.scheduledAt, { month: 1 })
        break
      case ENUM_PUSH_TYPE.YEARLY:
        scheduledAt = this.dateService.forward(push.scheduledAt, { year: 1 })
        break
      default:
        break
    }

    return await this.prisma.push.update({
      where: { id: push.id },
      data: {
        status: ENUM_PUSH_STATUS.PUSHING,
        retries: { increment: 1 },
        expiresAt,
        scheduledAt,
      },
    })
  }

  private async validate(push: TPush): Promise<boolean> {
    const { isActive, title, refId } = push.notification

    if (!isActive) return false
    if (!title) return false

    if (refId) {
      const notificationRef = await this.getNotificationRef(push.notification)
      if (!notificationRef) {
        return false
      }
    }

    return true
  }

  async process(push: TPush, logger: LoggerService): Promise<TPush> {
    // wait for pushing
    await this.pushing(push, logger)

    const { memberPushes, memberNotifications, totalDevice } =
      await this.getNotificationMembers(push)

    // force status to completed although invalid
    if (totalDevice == 0) {
      const memberIds = memberPushes.map((m: any) => m.id)
      logger.info(`Error: No devices ${JSON.stringify(memberIds)}`)
      return await this.success(push, logger)
    }

    const pushHistory = await this.prisma.pushHistory.create({
      data: {
        totalDevice,
        pushId: push.id,
        notificationId: push.notification.id,
      },
    })

    const memberMessageHistories: IPushHistoryData[] = []
    for (const mp of memberNotifications) {
      memberMessageHistories.push({
        pushHistoryId: pushHistory.id,
        memberId: mp.memberId,
        refId: mp.refId,
        refType: mp.refType,
        refValue: mp?.refValue,
        refDischarge: mp?.refDischarge,
      })
    }

    const chunks = this.helperService.arrayChunk(memberMessageHistories, 1_000)
    for (const data of chunks) {
      await this.prisma.memberNotifyHistory.createMany({ data })
    }

    const sentSuccessIds = []
    const sentFailureIds = []

    const memberData = { total: 0, allowPush: 0, denyPush: 0 }
    const memberGroup = MESSAGE_LANGUAGES.reduce((c, i) => {
      return Object.assign(c, { [i]: [] })
    }, {})

    for (const member of memberPushes) {
      const { isNotifiable, locale } = member
      if (isNotifiable && locale in memberGroup) {
        memberGroup[locale].push(member)
      }
      memberData.total += 1
      memberData.allowPush += isNotifiable ? 1 : 0
      memberData.denyPush += isNotifiable ? 0 : 1
    }

    logger.info(`PUSH HISTORY #${pushHistory.id} ${JSON.stringify(memberData)}`)

    for (const locale in memberGroup) {
      const members = memberGroup[locale] ?? []
      for (const member of members) {
        const tokens = member.devices
          .filter((device: any) => device.isActive && device.token)
          .map((device: any) => device.token)

        if (tokens.length === 0) continue

        const mp = memberMessageHistories.find((mp: any) => mp.memberId === member.id)
        if (!mp) continue

        try {
          const messageData: IPushMessageData = {
            historyId: `${mp.pushHistoryId}`,
            refId: `${mp.refId || ''}`,
            refType: mp.refType,
          }

          const sent = await this.notifier.sendMessage({
            to: tokens.join(','),
            subject: 'a',
            content: 'a',
            data: messageData,
          })

          // console.log(sent.successCount, sent.failureCount, sent.responses)

          // if (sent.successCount) {
          //   sentSuccessIds.push(member.id)
          // } else {
          //   sentFailureIds.push(member.id)
          // }
        } catch (err: unknown) {
          logger.error(err)
        }
      }
    }

    // mark member as pushed
    if (sentSuccessIds.length) {
      await this.prisma.memberNotifyHistory.updateMany({
        data: { pushedAt: pushHistory.createdAt },
        where: {
          pushHistoryId: pushHistory.id,
          memberId: { in: sentSuccessIds },
        },
      })
      logger.info(`Success members: ${sentSuccessIds.join(',')}`)
    }
    if (sentFailureIds.length) {
      logger.info(`Failure members: ${sentFailureIds.join(',')}`)
    }

    // completed
    return await this.success(push, logger)
  }

  async success(push: TPush, logger: LoggerService): Promise<TPush> {
    const dateNow = this.dateService.create()
    const dateExtract = this.dateService.extract(dateNow)

    let completed = push.type === ENUM_PUSH_TYPE.INSTANT

    if (push.type === ENUM_PUSH_TYPE.DATETIME) {
      completed = this.dateService.after(push.expiresAt, {
        sinceDate: dateExtract.date,
      })
    }

    if (
      push.type === ENUM_PUSH_TYPE.DAILY ||
      push.type === ENUM_PUSH_TYPE.MONTHLY ||
      push.type === ENUM_PUSH_TYPE.WEEKLY ||
      push.type === ENUM_PUSH_TYPE.YEARLY
    ) {
      if (push.untilDate) {
        completed = this.dateService.after(push.untilDate, {
          sinceDate: push.scheduledAt,
        })
      }
    }

    if (completed) {
      logger.info(`Complete: #${push.id}`)
      return await this.prisma.push.update({
        where: { id: push.id },
        data: { status: ENUM_PUSH_STATUS.COMPLETED },
      })
    }
    return push
  }

  async skip(push: TPush, logger: LoggerService): Promise<TPush> {
    logger.info(`Cancel: #${push.id}`)
    return await this.prisma.push.update({
      where: { id: push.id },
      data: { status: ENUM_PUSH_STATUS.CANCELED },
    })
  }
}
