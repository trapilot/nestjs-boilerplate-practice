import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@runtime/prisma-client'
import {
  IPrismaExportOptions,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { NotificationUtil } from '../helpers/notification.util'
import { TNotification, TPush } from '../interfaces/notification.interface'

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationUtil: NotificationUtil,
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

  async getPendingPushes(): Promise<TPush[]> {
    return await this.notificationUtil.getPendingPushes()
  }
}
