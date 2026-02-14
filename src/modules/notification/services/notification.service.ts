import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { EnumPushStatus, Prisma } from '@runtime/prisma-client'
import { EnumPushDriver } from 'lib/nest-core'
import {
  IPrismaExportOptions,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { TNotification, TPush } from '../interfaces/notification.interface'
import { NotificationDispatchPushWorkflow } from '../workflows/notification.dispatch-push.workflow'
import { NotificationSendPushWorkflow } from '../workflows/notification.send-push.workflow'

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dispathPushWorkflow: NotificationDispatchPushWorkflow,
    private readonly sendPushWorkflow: NotificationSendPushWorkflow,
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
    await this.sendPushWorkflow.execute(pushId, {
      memberId,
      drivers: [EnumPushDriver.ONESIGNAL],
    })
  }

  async dispatchPendingPushes(): Promise<void> {
    await this.dispathPushWorkflow.execute()
  }
}
