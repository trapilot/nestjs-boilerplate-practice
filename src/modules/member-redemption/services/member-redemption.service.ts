import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { EnumRedemptionStatus, Prisma } from '@runtime/prisma-client'
import {
  IPrismaOptions,
  IPrismaParams,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { TMemberRedemption } from '../interfaces/member-redemption.interface'

@Injectable()
export class MemberRedemptionService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(kwargs?: Prisma.MemberRedemptionFindUniqueArgs): Promise<TMemberRedemption> {
    return await this.prisma.memberRedemption.findUnique(kwargs)
  }

  async findFirst(kwargs: Prisma.MemberRedemptionFindFirstArgs = {}): Promise<TMemberRedemption> {
    return await this.prisma.memberRedemption.findFirst(kwargs)
  }

  async findAll(kwargs: Prisma.MemberRedemptionFindManyArgs = {}): Promise<TMemberRedemption[]> {
    return await this.prisma.memberRedemption.findMany(kwargs)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.MemberRedemptionFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TMemberRedemption> {
    const productHistory = await this.prisma.memberRedemption
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.memberRedemption.notFound',
        })
      })
    return productHistory
  }

  async matchOrFail(
    where: Prisma.MemberRedemptionWhereInput,
    kwargs: Omit<Prisma.MemberRedemptionFindFirstOrThrowArgs, 'where'> = {},
  ): Promise<TMemberRedemption> {
    const productHistory = await this.prisma.memberRedemption
      .findFirstOrThrow({ ...kwargs, where })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.memberRedemption.notFound',
        })
      })
    return productHistory
  }

  async differOrFail(
    where: Prisma.MemberRedemptionWhereInput,
    options?: { limit?: number; message?: string },
  ): Promise<void> {
    const totalRecords = await this.count(where)
    const limitRecords = options?.limit ?? 0
    if (totalRecords > limitRecords) {
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: options?.message ?? 'module.memberRedemption.conflict',
      })
    }
  }

  async list(
    where?: Prisma.MemberRedemptionWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.memberRedemption.list(where, params, options)
  }

  async paginate(
    where?: Prisma.MemberRedemptionWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.memberRedemption.paginate(where, params, options)
  }

  async count(where?: Prisma.MemberRedemptionWhereInput): Promise<number> {
    return await this.prisma.memberRedemption.count({
      where,
    })
  }

  async find(
    id: number,
    kwargs: Omit<Prisma.MemberRedemptionFindUniqueArgs, 'where'> = {},
  ): Promise<TMemberRedemption> {
    return await this.prisma.memberRedemption.findUnique({
      ...kwargs,
      where: { id },
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

  async delete(productHistory: TMemberRedemption, _deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async tx => {
        await tx.memberRedemption.delete({ where: { id: productHistory.id } })
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
