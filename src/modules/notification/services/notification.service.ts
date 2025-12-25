import { ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { IPrismaOptions, IPrismaParams, PrismaService } from 'lib/nest-prisma'
import { IResponseList, IResponsePaging } from 'lib/nest-web'
import { TNotification } from '../interfaces'

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(kwargs?: Prisma.NotificationFindUniqueArgs): Promise<TNotification> {
    return await this.prisma.notification.findUnique(kwargs)
  }

  async findFirst(kwargs: Prisma.NotificationFindFirstArgs = {}): Promise<TNotification> {
    return await this.prisma.notification.findFirst(kwargs)
  }

  async findAll(kwargs: Prisma.NotificationFindManyArgs = {}): Promise<TNotification[]> {
    return await this.prisma.notification.findMany(kwargs)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.NotificationFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TNotification> {
    const notification = await this.prisma.notification
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.notification.notFound',
        })
      })
    return notification
  }

  async differOrFail(
    where: Prisma.NotificationWhereInput,
    options?: { limit?: number; message?: string },
  ): Promise<void> {
    const totalRecords = await this.count(where)
    const limitRecords = options?.limit ?? 0
    if (totalRecords > limitRecords) {
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: options?.message ?? 'module.notification.conflict',
      })
    }
  }

  async matchOrFail(
    where: Prisma.NotificationWhereInput,
    kwargs: Omit<Prisma.NotificationFindFirstOrThrowArgs, 'where'> = {},
  ): Promise<TNotification> {
    const notification = await this.prisma.notification
      .findFirstOrThrow({ ...kwargs, where })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.notification.notFound',
        })
      })
    return notification
  }

  async list(
    where?: Prisma.NotificationWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponseList> {
    return await this.prisma.$extension(async (ex) => {
      return await ex.notification.list(where, params, options)
    })
  }

  async paginate(
    where?: Prisma.NotificationWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponsePaging> {
    return await this.prisma.$extension(async (ex) => {
      return await ex.notification.paginate(where, params, options)
    })
  }

  async count(where?: Prisma.NotificationWhereInput): Promise<number> {
    return await this.prisma.notification.count({
      where,
    })
  }

  async find(
    id: number,
    kwargs: Omit<Prisma.NotificationFindUniqueArgs, 'where'> = {},
  ): Promise<TNotification> {
    return await this.prisma.notification.findUnique({
      ...kwargs,
      where: { id },
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

  async delete(notification: TNotification, _deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.notification.delete({ where: { id: notification.id } })
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
}
