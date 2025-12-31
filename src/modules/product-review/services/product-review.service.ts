import { ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@runtime/prisma-client'
import {
  IPrismaOptions,
  IPrismaParams,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { TProductReview } from '../interfaces'

@Injectable()
export class ProductReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(kwargs?: Prisma.ProductReviewFindUniqueArgs): Promise<TProductReview> {
    return await this.prisma.client.productReview.findUnique(kwargs)
  }

  async findFirst(kwargs: Prisma.ProductReviewFindFirstArgs = {}): Promise<TProductReview> {
    return await this.prisma.client.productReview.findFirst(kwargs)
  }

  async findAll(kwargs: Prisma.ProductReviewFindManyArgs = {}): Promise<TProductReview[]> {
    return await this.prisma.client.productReview.findMany(kwargs)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.ProductReviewFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TProductReview> {
    const productReview = await this.prisma.client.productReview
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.productReview.notFound',
        })
      })
    return productReview
  }

  async matchOrFail(
    where: Prisma.ProductReviewWhereInput,
    kwargs: Omit<Prisma.ProductReviewFindFirstOrThrowArgs, 'where'> = {},
  ): Promise<TProductReview> {
    const productReview = await this.prisma.client.productReview
      .findFirstOrThrow({ ...kwargs, where })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.productReview.notFound',
        })
      })
    return productReview
  }

  async differOrFail(
    where: Prisma.ProductReviewWhereInput,
    options?: { limit?: number; message?: string },
  ): Promise<void> {
    const totalRecords = await this.count(where)
    const limitRecords = options?.limit ?? 0
    if (totalRecords > limitRecords) {
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: options?.message ?? 'module.productReview.conflict',
      })
    }
  }

  async list(
    where?: Prisma.ProductReviewWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.client.productReview.list(where, params, options)
  }

  async paginate(
    where?: Prisma.ProductReviewWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.client.productReview.paginate(where, params, options)
  }

  async count(where?: Prisma.ProductReviewWhereInput): Promise<number> {
    return await this.prisma.client.productReview.count({
      where,
    })
  }

  async find(
    id: number,
    kwargs: Omit<Prisma.ProductReviewFindUniqueArgs, 'where'> = {},
  ): Promise<TProductReview> {
    return await this.prisma.client.productReview.findUnique({
      ...kwargs,
      where: { id },
    })
  }

  async create(data: Prisma.ProductReviewUncheckedCreateInput): Promise<TProductReview> {
    const productReview = await this.prisma.client.productReview.create({
      data,
    })
    return productReview
  }

  async update(
    id: number,
    data: Prisma.ProductReviewUncheckedUpdateInput,
  ): Promise<TProductReview> {
    const productReview = await this.findOrFail(id)

    return await this.prisma.client.productReview.update({
      data,
      where: { id: productReview.id },
    })
  }

  async delete(productReview: TProductReview, _deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.client.$transaction(async (tx) => {
        await tx.productReview.delete({ where: { id: productReview.id } })
      })
      return true
    } catch {
      return false
    }
  }
}
