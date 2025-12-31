import { ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@runtime/prisma-client'
import {
  IPrismaOptions,
  IPrismaParams,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { TNotificationHistory } from '../interfaces'

@Injectable()
export class NotificationHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(kwargs?: Prisma.MemberNotifyHistoryFindUniqueArgs): Promise<TNotificationHistory> {
    return await this.prisma.client.memberNotifyHistory.findUnique(kwargs)
  }

  async findFirst(
    kwargs: Prisma.MemberNotifyHistoryFindFirstArgs = {},
  ): Promise<TNotificationHistory> {
    return await this.prisma.client.memberNotifyHistory.findFirst(kwargs)
  }

  async findAll(
    kwargs: Prisma.MemberNotifyHistoryFindManyArgs = {},
  ): Promise<TNotificationHistory[]> {
    return await this.prisma.client.memberNotifyHistory.findMany(kwargs)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.MemberNotifyHistoryFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TNotificationHistory> {
    const notificationHistory = await this.prisma.client.memberNotifyHistory
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.memberNotifyHistory.notFound',
        })
      })
    return notificationHistory
  }

  async matchOrFail(
    where: Prisma.MemberNotifyHistoryWhereInput,
    kwargs: Omit<Prisma.MemberNotifyHistoryFindFirstOrThrowArgs, 'where'> = {},
  ): Promise<TNotificationHistory> {
    const notificationHistory = await this.prisma.client.memberNotifyHistory
      .findFirstOrThrow({ ...kwargs, where })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.memberNotifyHistory.notFound',
        })
      })
    return notificationHistory
  }

  async differOrFail(
    where: Prisma.MemberNotifyHistoryWhereInput,
    options?: { limit?: number; message?: string },
  ): Promise<void> {
    const totalRecords = await this.count(where)
    const limitRecords = options?.limit ?? 0
    if (totalRecords > limitRecords) {
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: options?.message ?? 'module.memberNotifyHistory.conflict',
      })
    }
  }

  async list(
    where?: Prisma.MemberNotifyHistoryWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.client.memberNotifyHistory.list(where, params, options)
  }

  async paginate(
    where?: Prisma.MemberNotifyHistoryWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.client.memberNotifyHistory.paginate(where, params, options)
  }

  async count(where?: Prisma.MemberNotifyHistoryWhereInput): Promise<number> {
    return await this.prisma.client.memberNotifyHistory.count({
      where,
    })
  }

  async find(
    id: number,
    kwargs: Omit<Prisma.MemberNotifyHistoryFindUniqueArgs, 'where'> = {},
  ): Promise<TNotificationHistory> {
    return await this.prisma.client.memberNotifyHistory.findUnique({
      ...kwargs,
      where: { id },
    })
  }

  async create(
    data: Prisma.MemberNotifyHistoryUncheckedCreateInput,
  ): Promise<TNotificationHistory> {
    const notificationHistory = await this.prisma.client.memberNotifyHistory.create({
      data,
    })
    return notificationHistory
  }

  async update(
    id: number,
    data: Prisma.MemberNotifyHistoryUncheckedUpdateInput,
  ): Promise<TNotificationHistory> {
    const notificationHistory = await this.findOrFail(id)

    return await this.prisma.client.memberNotifyHistory.update({
      data,
      where: { id: notificationHistory.id },
    })
  }

  async delete(notificationHistory: TNotificationHistory, _deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.client.$transaction(async (tx) => {
        await tx.memberNotifyHistory.delete({ where: { id: notificationHistory.id } })
      })
      return true
    } catch {
      return false
    }
  }
}
