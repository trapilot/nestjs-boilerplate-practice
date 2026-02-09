import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@runtime/prisma-client'
import {
  IPrismaExportOptions,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { TProductReview } from '../interfaces/product-review.interface'

@Injectable()
export class ProductReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async getOne(kwargs: Prisma.ProductReviewFindUniqueArgs): Promise<TProductReview> {
    return await this.prisma.productReview.findUnique(kwargs)
  }

  async getFirst(kwargs?: Prisma.ProductReviewFindFirstArgs): Promise<TProductReview> {
    return await this.prisma.productReview.findFirst(kwargs)
  }

  async getMany(kwargs?: Prisma.ProductReviewFindManyArgs): Promise<TProductReview[]> {
    return await this.prisma.productReview.findMany(kwargs)
  }

  async getList(
    kwargs: Prisma.ProductReviewFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.productReview.list(kwargs, options)
  }

  async getPage(
    kwargs: Prisma.ProductReviewFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.productReview.paginate(kwargs, options)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.ProductReviewFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TProductReview> {
    return await this.prisma.productReview
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.productReview.notFound',
        })
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

  async delete(id: number, _deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async tx => {
        await tx.productReview.delete({ where: { id } })
      })
      return true
    } catch {
      return false
    }
  }
}
