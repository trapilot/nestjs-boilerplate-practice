import { ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@runtime/prisma-client'
import {
  IPrismaOptions,
  IPrismaParams,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { TTierHistory } from '../interfaces'

@Injectable()
export class TierHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(kwargs?: Prisma.MemberTierHistoryFindUniqueArgs): Promise<TTierHistory> {
    return await this.prisma.client.memberTierHistory.findUnique(kwargs)
  }

  async findFirst(kwargs: Prisma.MemberTierHistoryFindFirstArgs = {}): Promise<TTierHistory> {
    return await this.prisma.client.memberTierHistory.findFirst(kwargs)
  }

  async findAll(kwargs: Prisma.MemberTierHistoryFindManyArgs = {}): Promise<TTierHistory[]> {
    return await this.prisma.client.memberTierHistory.findMany(kwargs)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.MemberTierHistoryFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TTierHistory> {
    const tierHistory = await this.prisma.client.memberTierHistory
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
    const tierHistory = await this.prisma.client.memberTierHistory
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
  ): Promise<IPrismaReturnList> {
    return await this.prisma.client.memberTierHistory.list(where, params, options)
  }

  async paginate(
    where?: Prisma.MemberTierHistoryWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.client.memberTierHistory.paginate(where, params, options)
  }

  async count(where?: Prisma.MemberTierHistoryWhereInput): Promise<number> {
    return await this.prisma.client.memberTierHistory.count({
      where,
    })
  }

  async find(
    id: number,
    kwargs: Omit<Prisma.MemberTierHistoryFindUniqueArgs, 'where'> = {},
  ): Promise<TTierHistory> {
    return await this.prisma.client.memberTierHistory.findUnique({
      ...kwargs,
      where: { id },
    })
  }

  async create(data: Prisma.MemberTierHistoryUncheckedCreateInput): Promise<TTierHistory> {
    const tierHistory = await this.prisma.client.memberTierHistory.create({
      data,
    })
    return tierHistory
  }

  async update(
    id: number,
    data: Prisma.MemberTierHistoryUncheckedUpdateInput,
  ): Promise<TTierHistory> {
    const tierHistory = await this.findOrFail(id)
    return await this.prisma.client.memberTierHistory.update({
      data,
      where: { id: tierHistory.id },
    })
  }

  async delete(tierHistory: TTierHistory, _deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.client.$transaction(async (tx) => {
        await tx.memberTierHistory.delete({ where: { id: tierHistory.id } })
      })
      return true
    } catch {
      return false
    }
  }
}
