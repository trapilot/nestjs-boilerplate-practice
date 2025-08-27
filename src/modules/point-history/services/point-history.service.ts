import { ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { IPrismaOptions, IPrismaParams, PrismaService } from 'lib/nest-prisma'
import { IResponseList, IResponsePaging } from 'lib/nest-web'
import { TPointHistory } from '../interfaces'

@Injectable()
export class PointHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(kwargs?: Prisma.MemberPointHistoryFindUniqueArgs): Promise<TPointHistory> {
    return await this.prisma.memberPointHistory.findUnique(kwargs)
  }

  async findFirst(kwargs: Prisma.MemberPointHistoryFindFirstArgs = {}): Promise<TPointHistory> {
    return await this.prisma.memberPointHistory.findFirst(kwargs)
  }

  async findAll(kwargs: Prisma.MemberPointHistoryFindManyArgs = {}): Promise<TPointHistory[]> {
    return await this.prisma.memberPointHistory.findMany(kwargs)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.MemberPointHistoryFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TPointHistory> {
    const pointHistory = await this.prisma.memberPointHistory
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.memberPointHistory.notFound',
        })
      })
    return pointHistory
  }

  async matchOrFail(
    where: Prisma.MemberPointHistoryWhereInput,
    kwargs: Omit<Prisma.MemberPointHistoryFindFirstOrThrowArgs, 'where'> = {},
  ): Promise<TPointHistory> {
    const pointHistory = await this.prisma.memberPointHistory
      .findFirstOrThrow({ ...kwargs, where })
      .catch((err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.memberPointHistory.notFound',
        })
      })
    return pointHistory
  }

  async differOrFail(
    where: Prisma.MemberPointHistoryWhereInput,
    options?: { limit?: number; message?: string },
  ): Promise<void> {
    const totalRecords = await this.count(where)
    const limitRecords = options?.limit ?? 0
    if (totalRecords > limitRecords) {
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: options?.message ?? 'module.memberPointHistory.conflict',
      })
    }
  }

  async list(
    where?: Prisma.MemberPointHistoryWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponseList> {
    return await this.prisma.$listing(async (ex) => {
      return await ex.memberPointHistory.list(where, params, options)
    })
  }

  async paginate(
    where?: Prisma.MemberPointHistoryWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponsePaging> {
    return await this.prisma.$paginate(async (ex) => {
      return await ex.memberPointHistory.paginate(where, params, options)
    })
  }

  async count(where?: Prisma.MemberPointHistoryWhereInput): Promise<number> {
    return await this.prisma.memberPointHistory.count({
      where,
    })
  }

  async find(
    id: number,
    kwargs: Omit<Prisma.MemberPointHistoryFindUniqueArgs, 'where'> = {},
  ): Promise<TPointHistory> {
    return await this.prisma.memberPointHistory.findUnique({
      ...kwargs,
      where: { id },
    })
  }

  async create(data: Prisma.MemberPointHistoryUncheckedCreateInput): Promise<TPointHistory> {
    const pointHistory = await this.prisma.memberPointHistory.create({
      data,
    })
    return pointHistory
  }

  async update(
    id: number,
    data: Prisma.MemberPointHistoryUncheckedUpdateInput,
  ): Promise<TPointHistory> {
    const pointHistory = await this.findOrFail(id)

    return await this.prisma.memberPointHistory.update({
      data,
      where: { id: pointHistory.id },
    })
  }

  async delete(pointHistory: TPointHistory, deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.memberPointHistory.delete({ where: { id: pointHistory.id } })
      })
      return true
    } catch {
      return false
    }
  }
}
