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
import { TProductHistory } from '../interfaces'

@Injectable()
export class ProductHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(kwargs?: Prisma.MemberProductHistoryFindUniqueArgs): Promise<TProductHistory> {
    return await this.prisma.memberProductHistory.findUnique(kwargs)
  }

  async findFirst(kwargs: Prisma.MemberProductHistoryFindFirstArgs = {}): Promise<TProductHistory> {
    return await this.prisma.memberProductHistory.findFirst(kwargs)
  }

  async findAll(kwargs: Prisma.MemberProductHistoryFindManyArgs = {}): Promise<TProductHistory[]> {
    return await this.prisma.memberProductHistory.findMany(kwargs)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.MemberProductHistoryFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TProductHistory> {
    const productHistory = await this.prisma.memberProductHistory
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.memberProductHistory.notFound',
        })
      })
    return productHistory
  }

  async matchOrFail(
    where: Prisma.MemberProductHistoryWhereInput,
    kwargs: Omit<Prisma.MemberProductHistoryFindFirstOrThrowArgs, 'where'> = {},
  ): Promise<TProductHistory> {
    const productHistory = await this.prisma.memberProductHistory
      .findFirstOrThrow({ ...kwargs, where })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.memberProductHistory.notFound',
        })
      })
    return productHistory
  }

  async differOrFail(
    where: Prisma.MemberProductHistoryWhereInput,
    options?: { limit?: number; message?: string },
  ): Promise<void> {
    const totalRecords = await this.count(where)
    const limitRecords = options?.limit ?? 0
    if (totalRecords > limitRecords) {
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: options?.message ?? 'module.memberProductHistory.conflict',
      })
    }
  }

  async list(
    where?: Prisma.MemberProductHistoryWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.memberProductHistory.list(where, params, options)
  }

  async paginate(
    where?: Prisma.MemberProductHistoryWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.memberProductHistory.paginate(where, params, options)
  }

  async count(where?: Prisma.MemberProductHistoryWhereInput): Promise<number> {
    return await this.prisma.memberProductHistory.count({
      where,
    })
  }

  async find(
    id: number,
    kwargs: Omit<Prisma.MemberProductHistoryFindUniqueArgs, 'where'> = {},
  ): Promise<TProductHistory> {
    return await this.prisma.memberProductHistory.findUnique({
      ...kwargs,
      where: { id },
    })
  }

  async create(data: Prisma.MemberProductHistoryUncheckedCreateInput): Promise<TProductHistory> {
    const productHistory = await this.prisma.memberProductHistory.create({
      data,
    })
    return productHistory
  }

  async update(
    id: number,
    data: Prisma.MemberProductHistoryUncheckedUpdateInput,
  ): Promise<TProductHistory> {
    const productHistory = await this.findOrFail(id)

    return await this.prisma.memberProductHistory.update({
      data,
      where: { id: productHistory.id },
    })
  }

  async delete(productHistory: TProductHistory, _deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async tx => {
        await tx.memberProductHistory.delete({ where: { id: productHistory.id } })
      })
      return true
    } catch {
      return false
    }
  }

  async reserve(productHistory: TProductHistory): Promise<TProductHistory> {
    if (productHistory.status === EnumRedemptionStatus.RESERVED) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'module.memberProductHistory.alreadyReserved',
      })
    }

    if (productHistory.status !== EnumRedemptionStatus.APPROVED) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'module.memberProductHistory.notApprovedYet',
      })
    }

    return await this.prisma.memberProductHistory.update({
      where: { id: productHistory.id },
      data: { status: EnumRedemptionStatus.RESERVED },
      include: {
        product: true,
        order: true,
      },
    })
  }
}
