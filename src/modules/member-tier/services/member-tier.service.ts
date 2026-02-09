import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@runtime/prisma-client'
import {
  IPrismaExportOptions,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { TierService } from 'modules/tier/services/tier.service'
import { TMemberTier } from '../interfaces/member-tier.interface'

@Injectable()
export class MemberTierService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tierService: TierService,
  ) {}

  async getOne(kwargs: Prisma.MemberTierFindUniqueArgs): Promise<TMemberTier> {
    return await this.prisma.memberTier.findUnique(kwargs)
  }

  async getFirst(kwargs?: Prisma.MemberTierFindFirstArgs): Promise<TMemberTier> {
    return await this.prisma.memberTier.findFirst(kwargs)
  }

  async getMany(kwargs?: Prisma.MemberTierFindManyArgs): Promise<TMemberTier[]> {
    return await this.prisma.memberTier.findMany(kwargs)
  }

  async getList(
    kwargs: Prisma.MemberTierFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.memberTier.list(kwargs, options)
  }

  async getPage(
    kwargs: Prisma.MemberTierFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.memberTier.paginate(kwargs, options)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.MemberTierFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TMemberTier> {
    return await this.prisma.memberTier
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.memberTier.notFound',
        })
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

  async delete(id: number, _deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async tx => {
        await tx.memberTier.delete({ where: { id } })
      })
      return true
    } catch {
      return false
    }
  }
}
