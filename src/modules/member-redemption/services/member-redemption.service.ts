import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { EnumRedemptionStatus, Prisma } from '@runtime/prisma-client'
import {
  IPrismaExportOptions,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { TMemberRedemption } from '../interfaces/member-redemption.interface'

@Injectable()
export class MemberRedemptionService {
  constructor(private readonly prisma: PrismaService) {}

  async getOne(kwargs: Prisma.MemberRedemptionFindUniqueArgs): Promise<TMemberRedemption> {
    return await this.prisma.memberRedemption.findUnique(kwargs)
  }

  async getFirst(kwargs?: Prisma.MemberRedemptionFindFirstArgs): Promise<TMemberRedemption> {
    return await this.prisma.memberRedemption.findFirst(kwargs)
  }

  async getMany(kwargs?: Prisma.MemberRedemptionFindManyArgs): Promise<TMemberRedemption[]> {
    return await this.prisma.memberRedemption.findMany(kwargs)
  }

  async getList(
    kwargs: Prisma.MemberRedemptionFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.memberRedemption.list(kwargs, options)
  }

  async getPage(
    kwargs: Prisma.MemberRedemptionFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.memberRedemption.paginate(kwargs, options)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.MemberRedemptionFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TMemberRedemption> {
    return await this.prisma.memberRedemption
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.memberRedemption.notFound',
        })
      })
  }

  async create(data: Prisma.MemberRedemptionUncheckedCreateInput): Promise<TMemberRedemption> {
    const productHistory = await this.prisma.memberRedemption.create({
      data,
    })
    return productHistory
  }

  async update(
    id: number,
    data: Prisma.MemberRedemptionUncheckedUpdateInput,
  ): Promise<TMemberRedemption> {
    const productHistory = await this.findOrFail(id)

    return await this.prisma.memberRedemption.update({
      data,
      where: { id: productHistory.id },
    })
  }

  async delete(id: number, _deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async tx => {
        await tx.memberRedemption.delete({ where: { id } })
      })
      return true
    } catch {
      return false
    }
  }

  async reserve(productHistory: TMemberRedemption): Promise<TMemberRedemption> {
    if (productHistory.status === EnumRedemptionStatus.RESERVED) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'module.memberRedemption.alreadyReserved',
      })
    }

    if (productHistory.status !== EnumRedemptionStatus.APPROVED) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'module.memberRedemption.notApprovedYet',
      })
    }

    return await this.prisma.memberRedemption.update({
      where: { id: productHistory.id },
      data: { status: EnumRedemptionStatus.RESERVED },
      include: {
        product: true,
        order: true,
      },
    })
  }
}
