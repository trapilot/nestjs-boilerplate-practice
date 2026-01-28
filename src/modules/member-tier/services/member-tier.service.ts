import { ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@runtime/prisma-client'
import {
  IPrismaOptions,
  IPrismaParams,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { TMemberTier } from '../interfaces'

@Injectable()
export class MemberTierService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(kwargs?: Prisma.MemberTierFindUniqueArgs): Promise<TMemberTier> {
    return await this.prisma.memberTier.findUnique(kwargs)
  }

  async findFirst(kwargs: Prisma.MemberTierFindFirstArgs = {}): Promise<TMemberTier> {
    return await this.prisma.memberTier.findFirst(kwargs)
  }

  async findAll(kwargs: Prisma.MemberTierFindManyArgs = {}): Promise<TMemberTier[]> {
    return await this.prisma.memberTier.findMany(kwargs)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.MemberTierFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TMemberTier> {
    const tierHistory = await this.prisma.memberTier
      .findUniqueOrThrow({
        ...kwargs,
        where: { id },
      })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.memberTier.notFound',
        })
      })
    return tierHistory
  }

  async matchOrFail(
    where: Prisma.MemberTierWhereInput,
    kwargs: Omit<Prisma.MemberTierFindFirstOrThrowArgs, 'where'> = {},
  ): Promise<TMemberTier> {
    const tierHistory = await this.prisma.memberTier
      .findFirstOrThrow({
        ...kwargs,
        where,
      })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.memberTier.notFound',
        })
      })
    return tierHistory
  }

  async differOrFail(
    where: Prisma.MemberTierWhereInput,
    options?: { limit?: number; message?: string },
  ): Promise<void> {
    const totalRecords = await this.count(where)
    const limitRecords = options?.limit ?? 0
    if (totalRecords > limitRecords) {
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: options?.message ?? 'module.memberTier.conflict',
      })
    }
  }

  async list(
    where?: Prisma.MemberTierWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.memberTier.list(where, params, options)
  }

  async paginate(
    where?: Prisma.MemberTierWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.memberTier.paginate(where, params, options)
  }

  async count(where?: Prisma.MemberTierWhereInput): Promise<number> {
    return await this.prisma.memberTier.count({
      where,
    })
  }

  async find(
    id: number,
    kwargs: Omit<Prisma.MemberTierFindUniqueArgs, 'where'> = {},
  ): Promise<TMemberTier> {
    return await this.prisma.memberTier.findUnique({
      ...kwargs,
      where: { id },
    })
  }

  async create(data: Prisma.MemberTierUncheckedCreateInput): Promise<TMemberTier> {
    const tierHistory = await this.prisma.memberTier.create({
      data,
    })
    return tierHistory
  }

  async update(id: number, data: Prisma.MemberTierUncheckedUpdateInput): Promise<TMemberTier> {
    const tierHistory = await this.findOrFail(id)
    return await this.prisma.memberTier.update({
      data,
      where: { id: tierHistory.id },
    })
  }

  async delete(tierHistory: TMemberTier, _deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async tx => {
        await tx.memberTier.delete({ where: { id: tierHistory.id } })
      })
      return true
    } catch {
      return false
    }
  }
}
