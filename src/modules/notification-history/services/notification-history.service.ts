import { ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { IPrismaOptions, IPrismaParams, PrismaService } from 'lib/nest-prisma'
import { IResponseList, IResponsePaging } from 'lib/nest-web'
import { TNotificationHistory } from '../interfaces'

@Injectable()
export class NotificationHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(kwargs?: Prisma.MemberNotifyHistoryFindUniqueArgs): Promise<TNotificationHistory> {
    return await this.prisma.memberNotifyHistory.findUnique(kwargs)
  }

  async findFirst(
    kwargs: Prisma.MemberNotifyHistoryFindFirstArgs = {},
  ): Promise<TNotificationHistory> {
    return await this.prisma.memberNotifyHistory.findFirst(kwargs)
  }

  async findAll(
    kwargs: Prisma.MemberNotifyHistoryFindManyArgs = {},
  ): Promise<TNotificationHistory[]> {
    return await this.prisma.memberNotifyHistory.findMany(kwargs)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.MemberNotifyHistoryFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TNotificationHistory> {
    const notificationHistory = await this.prisma.memberNotifyHistory
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((err: unknown) => {
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
    const notificationHistory = await this.prisma.memberNotifyHistory
      .findFirstOrThrow({ ...kwargs, where })
      .catch((err: unknown) => {
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
  ): Promise<IResponseList> {
    return await this.prisma.$extension(async (ex) => {
      return await ex.memberNotifyHistory.list(where, params, options)
    })
  }

  async paginate(
    where?: Prisma.MemberNotifyHistoryWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponsePaging> {
    return await this.prisma.$extension(async (ex) => {
      return await ex.memberNotifyHistory.paginate(where, params, options)
    })
  }

  async count(where?: Prisma.MemberNotifyHistoryWhereInput): Promise<number> {
    return await this.prisma.memberNotifyHistory.count({
      where,
    })
  }

  async find(
    id: number,
    kwargs: Omit<Prisma.MemberNotifyHistoryFindUniqueArgs, 'where'> = {},
  ): Promise<TNotificationHistory> {
    return await this.prisma.memberNotifyHistory.findUnique({
      ...kwargs,
      where: { id },
    })
  }

  async create(
    data: Prisma.MemberNotifyHistoryUncheckedCreateInput,
  ): Promise<TNotificationHistory> {
    const notificationHistory = await this.prisma.memberNotifyHistory.create({
      data,
    })
    return notificationHistory
  }

  async update(
    id: number,
    data: Prisma.MemberNotifyHistoryUncheckedUpdateInput,
  ): Promise<TNotificationHistory> {
    const notificationHistory = await this.findOrFail(id)

    return await this.prisma.memberNotifyHistory.update({
      data,
      where: { id: notificationHistory.id },
    })
  }

  async delete(notificationHistory: TNotificationHistory, deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.memberNotifyHistory.delete({ where: { id: notificationHistory.id } })
      })
      return true
    } catch {
      return false
    }
  }
}
