import { ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@runtime/prisma-client'
import { IPrismaOptions, IPrismaParams, PrismaService } from 'lib/nest-prisma'
import { IResponseList, IResponsePaging } from 'lib/nest-web'
import { TProductReview } from '../interfaces'

@Injectable()
export class ProductReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(kwargs?: Prisma.ProductReviewFindUniqueArgs): Promise<TProductReview> {
    return await this.prisma.productReview.findUnique(kwargs)
  }

  async findFirst(kwargs: Prisma.ProductReviewFindFirstArgs = {}): Promise<TProductReview> {
    return await this.prisma.productReview.findFirst(kwargs)
  }

  async findAll(kwargs: Prisma.ProductReviewFindManyArgs = {}): Promise<TProductReview[]> {
    return await this.prisma.productReview.findMany(kwargs)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.ProductReviewFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TProductReview> {
    const productReview = await this.prisma.productReview
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
    const productReview = await this.prisma.productReview
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
  ): Promise<IResponseList> {
    return await this.prisma.$extension(async (ex) => {
      return await ex.productReview.list(where, params, options)
    })
  }

  async paginate(
    where?: Prisma.ProductReviewWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponsePaging> {
    return await this.prisma.$extension(async (ex) => {
      return await ex.productReview.paginate(where, params, options)
    })
  }

  async count(where?: Prisma.ProductReviewWhereInput): Promise<number> {
    return await this.prisma.productReview.count({
      where,
    })
  }

  async find(
    id: number,
    kwargs: Omit<Prisma.ProductReviewFindUniqueArgs, 'where'> = {},
  ): Promise<TProductReview> {
    return await this.prisma.productReview.findUnique({
      ...kwargs,
      where: { id },
    })
  }

  async create(data: Prisma.ProductReviewUncheckedCreateInput): Promise<TProductReview> {
    const productReview = await this.prisma.productReview.create({
      data,
    })
    return productReview
  }

  async update(
    id: number,
    data: Prisma.ProductReviewUncheckedUpdateInput,
  ): Promise<TProductReview> {
    const productReview = await this.findOrFail(id)

    return await this.prisma.productReview.update({
      data,
      where: { id: productReview.id },
    })
  }

  async delete(productReview: TProductReview, _deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.productReview.delete({ where: { id: productReview.id } })
      })
      return true
    } catch {
      return false
    }
  }
}
