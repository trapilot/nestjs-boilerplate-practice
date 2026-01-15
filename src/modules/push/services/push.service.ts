import { ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { EnumPushStatus, EnumPushType, Notification, Prisma } from '@runtime/prisma-client'
import { ArrUtil, HelperService, LoggerService, MESSAGE_LANGUAGES } from 'lib/nest-core'
import {
  IPrismaOptions,
  IPrismaParams,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { NotifierService } from 'shared/services'
import {
  IPushAnalyticOptions,
  IPushHistoryData,
  IPushMemberGroup,
  IPushMessageData,
  TPush,
} from '../interfaces'

@Injectable()
export class PushService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly notifyService: NotifierService,
    private readonly helperService: HelperService
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
    kwargs: Omit<Prisma.PushFindUniqueOrThrowArgs, 'where'> = {}
  ): Promise<TPush> {
    const push = await this.prisma.push
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.push.notFound',
        })
      })
    return push
  }

  async differOrFail(
    where: Prisma.PushWhereInput,
    options?: { limit?: number; message?: string }
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
    kwargs: Omit<Prisma.PushFindFirstOrThrowArgs, 'where'> = {}
  ): Promise<TPush> {
    const push = await this.prisma.push
      .findFirstOrThrow({ ...kwargs, where })
      .catch((_err: unknown) => {
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
    options?: IPrismaOptions
  ): Promise<IPrismaReturnList> {
    return await this.prisma.push.list(where, params, options)
  }

  async paginate(
    where?: Prisma.PushWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.push.paginate(where, params, options)
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

  async delete(push: TPush, _deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async tx => {
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
        status: EnumPushStatus.PUSHING,
        isActive: true,
      },
    })
  }

  async getPending(): Promise<TPush> {
    const nowDate = this.helperService.dateNow()
    const dateExtract = this.helperService.dateExtract(nowDate)

    const currentDate = dateExtract.date

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
        type: EnumPushType.INSTANT,
        status: EnumPushStatus.PENDING,
      },
    })
    if (instant) {
      return instant
    }

    // special date time
    const specialDateRule = await this.findFirst({
      ..._kwargs,
      where: {
        ..._where,
        type: EnumPushType.DATETIME,
        status: EnumPushStatus.PENDING,
      },
    })
    if (specialDateRule) {
      return specialDateRule
    }

    // other rule
    return await this.findFirst({
      ..._kwargs,
      where: {
        ..._where,
        type: {
          in: [EnumPushType.DAILY, EnumPushType.WEEKLY, EnumPushType.MONTHLY, EnumPushType.YEARLY],
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

  private async getNotificationRef(_notification: Notification): Promise<boolean> {
    return true
  }

  private async matchNotificationMembers(push: TPush): Promise<IPushAnalyticOptions> {
    let totalDevice: IPushAnalyticOptions['totalDevice'] = 0
    const members: IPushAnalyticOptions['members'] = []
    const notifications: IPushAnalyticOptions['notifications'] = []

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
          select: { isActive: true, token: true },
        },
      },
    })

    for (const member of memberWithDevices) {
      totalDevice += member.deviceHistories.length
      members.push({
        id: member.id,
        locale: member.locale,
        isNotifiable: member.isNotifiable,
        devices: member.deviceHistories.map(dh => {
          return { isActive: dh.isActive, token: dh.token }
        }),
      })
      notifications.push({
        memberId: member.id,
        refId: push.notification.refId,
        refType: push.notification.type,
      })
    }

    return {
      members,
      notifications,
      totalDevice,
    }
  }

  private async pushing(push: TPush): Promise<TPush> {
    this.logger.log(`Pushing: #${push.id}`)

    const isValid = await this.validate(push)
    if (!isValid) {
      this.logger.log(`Error: Invalid data`)
      return await this.skip(push)
    }

    const nowDate = this.helperService.dateNow()
    const expiresAt = this.helperService.dateForward(push.untilDate || nowDate, {
      minutes: 5,
    })

    let scheduledAt = this.helperService.dateSet(push.scheduledAt, {
      hour: push.hours,
      minute: push.minutes,
      second: push.seconds,
      millisecond: 0,
    })

    switch (push.type) {
      case EnumPushType.DAILY:
        scheduledAt = this.helperService.dateForward(push.scheduledAt, { days: 1 })
        break
      case EnumPushType.WEEKLY:
        scheduledAt = this.helperService.dateForward(push.scheduledAt, { days: 7 })
        break
      case EnumPushType.MONTHLY:
        scheduledAt = this.helperService.dateForward(push.scheduledAt, { month: 1 })
        break
      case EnumPushType.YEARLY:
        scheduledAt = this.helperService.dateForward(push.scheduledAt, { year: 1 })
        break
      default:
        break
    }

    return await this.prisma.push.update({
      where: { id: push.id },
      data: {
        status: EnumPushStatus.PUSHING,
        retries: { increment: 1 },
        expiresAt,
        scheduledAt,
      },
    })
  }

  private async validate(push: TPush): Promise<boolean> {
    const { isActive, title, refId } = push.notification

    if (!isActive) {
      return false
    }
    if (!title) {
      return false
    }

    if (refId) {
      const notificationRef = await this.getNotificationRef(push.notification)
      if (!notificationRef) {
        return false
      }
    }

    return true
  }

  async process(push: TPush): Promise<TPush> {
    // wait for pushing
    await this.pushing(push)

    const { members, notifications, totalDevice } = await this.matchNotificationMembers(push)

    // force status to completed although invalid
    if (totalDevice === 0) {
      const memberIds = members.map(m => m.id)
      this.logger.log(`Error: No devices ${JSON.stringify(memberIds)}`)
      return await this.success(push)
    }

    const pushHistory = await this.prisma.pushHistory.create({
      data: {
        totalDevice,
        pushId: push.id,
        notificationId: push.notification.id,
      },
    })

    const memberMessageHistories: IPushHistoryData[] = []
    for (const n of notifications) {
      memberMessageHistories.push({
        pushHistoryId: pushHistory.id,
        memberId: n.memberId,
        refId: n.refId,
        refType: n.refType,
        refValue: n?.refValue,
        refDischarge: n?.refDischarge,
      })
    }

    const chunks = this.helperService.arrayChunk(memberMessageHistories, 1_000)
    for (const data of chunks) {
      await this.prisma.memberNotifyHistory.createMany({ data })
    }

    const sentSuccessIds = []
    const sentFailureIds = []

    const memberData = { total: 0, allowPush: 0, denyPush: 0 }
    const memberGroup: IPushMemberGroup = MESSAGE_LANGUAGES.reduce((c, i) => {
      return Object.assign(c, { [i]: [] })
    }, {})

    for (const member of members) {
      const { isNotifiable, locale } = member
      if (isNotifiable && locale in memberGroup) {
        memberGroup[locale].push(member)
      }
      memberData.total += 1
      memberData.allowPush += isNotifiable ? 1 : 0
      memberData.denyPush += isNotifiable ? 0 : 1
    }

    this.logger.log(`PUSH HISTORY #${pushHistory.id} ${JSON.stringify(memberData)}`)

    for (const locale in memberGroup) {
      const grpMembers = memberGroup[locale] ?? []
      for (const member of grpMembers) {
        const tokens = member.devices
          .filter(device => device.isActive && device.token)
          .map(device => device.token)

        if (tokens.length === 0) {
          continue
        }

        const mp = memberMessageHistories.find(mp => mp.memberId === member.id)
        if (!mp) {
          continue
        }

        try {
          const messageData: IPushMessageData = {
            historyId: `${mp.pushHistoryId}`,
            refId: `${mp.refId || ''}`,
            refType: mp.refType,
          }

          const _sent = await this.notifyService.sendMessage({
            to: ArrUtil.join(tokens, { delimiter: ',', allowEmpty: false }),
            subject: 'test',
            content: 'test',
            data: messageData,
          })

          // console.log(sent.successCount, sent.failureCount, sent.responses)

          // if (sent.successCount) {
          //   sentSuccessIds.push(member.id)
          // } else {
          //   sentFailureIds.push(member.id)
          // }
        } catch (err: unknown) {
          this.logger.error(err)
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
    }
    if (sentFailureIds.length) {
    }

    // completed
    return await this.success(push)
  }

  async success(push: TPush): Promise<TPush> {
    const nowDate = this.helperService.dateNow()
    const dateExtract = this.helperService.dateExtract(nowDate)

    let completed = push.type === EnumPushType.INSTANT

    if (push.type === EnumPushType.DATETIME) {
      completed = this.helperService.dateCheckAfter(push.expiresAt, {
        sinceDate: dateExtract.date,
      })
    }

    if (
      push.type === EnumPushType.DAILY ||
      push.type === EnumPushType.MONTHLY ||
      push.type === EnumPushType.WEEKLY ||
      push.type === EnumPushType.YEARLY
    ) {
      if (push.untilDate) {
        completed = this.helperService.dateCheckAfter(push.untilDate, {
          sinceDate: push.scheduledAt,
        })
      }
    }

    if (completed) {
      this.logger.log(`Complete: #${push.id}`)
      return await this.prisma.push.update({
        where: { id: push.id },
        data: { status: EnumPushStatus.COMPLETED },
      })
    }
    return push
  }

  async skip(push: TPush): Promise<TPush> {
    this.logger.log(`Cancel: #${push.id}`)
    return await this.prisma.push.update({
      where: { id: push.id },
      data: { status: EnumPushStatus.CANCELED },
    })
  }
}
