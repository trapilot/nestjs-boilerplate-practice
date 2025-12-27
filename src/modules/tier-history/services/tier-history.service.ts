import { ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@runtime/prisma-client'
import { IPrismaOptions, IPrismaParams, PrismaService } from 'lib/nest-prisma'
import { IResponseList, IResponsePaging } from 'lib/nest-web'
import { TTierHistory } from '../interfaces'

@Injectable()
export class TierHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(kwargs?: Prisma.MemberTierHistoryFindUniqueArgs): Promise<TTierHistory> {
    return await this.prisma.memberTierHistory.findUnique(kwargs)
  }

  async findFirst(kwargs: Prisma.MemberTierHistoryFindFirstArgs = {}): Promise<TTierHistory> {
    return await this.prisma.memberTierHistory.findFirst(kwargs)
  }

  async findAll(kwargs: Prisma.MemberTierHistoryFindManyArgs = {}): Promise<TTierHistory[]> {
    return await this.prisma.memberTierHistory.findMany(kwargs)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.MemberTierHistoryFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TTierHistory> {
    const tierHistory = await this.prisma.memberTierHistory
      .findUniqueOrThrow({
        ...kwargs,
        where: { id },
      })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.memberTierHistory.notFound',
        })
      })
    return tierHistory
  }

  async matchOrFail(
    where: Prisma.MemberTierHistoryWhereInput,
    kwargs: Omit<Prisma.MemberTierHistoryFindFirstOrThrowArgs, 'where'> = {},
  ): Promise<TTierHistory> {
    const tierHistory = await this.prisma.memberTierHistory
      .findFirstOrThrow({
        ...kwargs,
        where,
      })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.memberTierHistory.notFound',
        })
      })
    return tierHistory
  }

  async differOrFail(
    where: Prisma.MemberTierHistoryWhereInput,
    options?: { limit?: number; message?: string },
  ): Promise<void> {
    const totalRecords = await this.count(where)
    const limitRecords = options?.limit ?? 0
    if (totalRecords > limitRecords) {
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: options?.message ?? 'module.memberTierHistory.conflict',
      })
    }
  }

  async list(
    where?: Prisma.MemberTierHistoryWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponseList> {
    return await this.prisma.$extension(async (ex) => {
      return await ex.memberTierHistory.list(where, params, options)
    })
  }

  async paginate(
    where?: Prisma.MemberTierHistoryWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponsePaging> {
    return await this.prisma.$extension(async (ex) => {
      return await ex.memberTierHistory.paginate(where, params, options)
    })
  }

  async count(where?: Prisma.MemberTierHistoryWhereInput): Promise<number> {
    return await this.prisma.memberTierHistory.count({
      where,
    })
  }

  async find(
    id: number,
    kwargs: Omit<Prisma.MemberTierHistoryFindUniqueArgs, 'where'> = {},
  ): Promise<TTierHistory> {
    return await this.prisma.memberTierHistory.findUnique({
      ...kwargs,
      where: { id },
    })
  }

  async create(data: Prisma.MemberTierHistoryUncheckedCreateInput): Promise<TTierHistory> {
    const tierHistory = await this.prisma.memberTierHistory.create({
      data,
    })
    return tierHistory
  }

  async update(
    id: number,
    data: Prisma.MemberTierHistoryUncheckedUpdateInput,
  ): Promise<TTierHistory> {
    const tierHistory = await this.findOrFail(id)
    return await this.prisma.memberTierHistory.update({
      data,
      where: { id: tierHistory.id },
    })
  }

  async delete(tierHistory: TTierHistory, _deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.memberTierHistory.delete({ where: { id: tierHistory.id } })
      })
      return true
    } catch {
      return false
    }
  }
}
