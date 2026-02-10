import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@runtime/prisma-client'
import { EnumTierCode } from 'lib/nest-core'
import {
  IPrismaExportOptions,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { TTier, TTierTransition } from '../interfaces/tier.interface'

@Injectable()
export class TierService {
  constructor(private readonly prisma: PrismaService) {}

  async getOne(kwargs: Prisma.TierFindUniqueArgs): Promise<TTier> {
    return await this.prisma.tier.findUnique(kwargs)
  }

  async getFirst(kwargs?: Prisma.TierFindFirstArgs): Promise<TTier> {
    return await this.prisma.tier.findFirst(kwargs)
  }

  async getMany(kwargs?: Prisma.TierFindManyArgs): Promise<TTier[]> {
    return await this.prisma.tier.findMany(kwargs)
  }

  async getList(
    kwargs: Prisma.TierFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.tier.list(kwargs, options)
  }

  async getPage(
    kwargs: Prisma.TierFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.tier.paginate(kwargs, options)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.TierFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TTier> {
    return await this.prisma.tier
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.tier.notFound',
        })
      })
  }

  async create(data: Prisma.TierUncheckedCreateInput): Promise<TTier> {
    const tier = await this.prisma.tier.create({
      data,
    })
    return tier
  }

  async update(id: number, data: Prisma.TierUncheckedUpdateInput): Promise<TTier> {
    const tier = await this.findOrFail(id)

    return await this.prisma.tier.update({
      data,
      where: { id: tier.id },
    })
  }

  async delete(id: number, _deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async tx => {
        await tx.tier.delete({ where: { id } })
      })
      return true
    } catch {
      return false
    }
  }

  async getNormalTier(): Promise<TTier> {
    return await this.getOne({
      where: { code: EnumTierCode.NORMAL },
    })
  }

  async getStaffTier(): Promise<TTier> {
    return await this.getOne({
      where: { code: EnumTierCode.BRONZE },
    })
  }

  async getTransitions(tierId: number, reverse: boolean = false): Promise<TTierTransition[]> {
    const transitions = await this.prisma.tierTransition.findMany({
      where: { prevTierId: tierId },
    })
    return reverse ? transitions.reverse() : transitions
  }
}
