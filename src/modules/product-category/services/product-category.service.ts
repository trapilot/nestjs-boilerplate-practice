import { ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { IPrismaOptions, IPrismaParams, PrismaService } from 'lib/nest-prisma'
import { IResponseList, IResponsePaging } from 'lib/nest-web'
import { TProductCategory } from '../interfaces'

@Injectable()
export class ProductCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(kwargs?: Prisma.ProductCategoryFindUniqueArgs): Promise<TProductCategory> {
    return await this.prisma.productCategory.findUnique(kwargs)
  }

  async findFirst(kwargs: Prisma.ProductCategoryFindFirstArgs = {}): Promise<TProductCategory> {
    return await this.prisma.productCategory.findFirst(kwargs)
  }

  async findAll(kwargs: Prisma.ProductCategoryFindManyArgs = {}): Promise<TProductCategory[]> {
    return await this.prisma.productCategory.findMany(kwargs)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.ProductCategoryFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TProductCategory> {
    const productCategory = await this.prisma.productCategory
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.productCategory.notFound',
        })
      })
    return productCategory
  }

  async matchOrFail(
    where: Prisma.ProductCategoryWhereInput,
    kwargs: Omit<Prisma.ProductCategoryFindFirstOrThrowArgs, 'where'> = {},
  ): Promise<TProductCategory> {
    const productCategory = await this.prisma.productCategory
      .findFirstOrThrow({ ...kwargs, where })
      .catch((err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.productCategory.notFound',
        })
      })
    return productCategory
  }

  async differOrFail(
    where: Prisma.ProductCategoryWhereInput,
    options?: { limit?: number; message?: string },
  ): Promise<void> {
    const totalRecords = await this.count(where)
    const limitRecords = options?.limit ?? 0
    if (totalRecords > limitRecords) {
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: options?.message ?? 'module.productCategory.conflict',
      })
    }
  }

  async list(
    where?: Prisma.ProductCategoryWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponseList> {
    return await this.prisma.$listing(async (ex) => {
      return await ex.productCategory.list(where, params, options)
    })
  }

  async paginate(
    where?: Prisma.ProductCategoryWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponsePaging> {
    return await this.prisma.$paginate(async (ex) => {
      return await ex.productCategory.paginate(where, params, options)
    })
  }

  async count(where?: Prisma.ProductCategoryWhereInput): Promise<number> {
    return await this.prisma.productCategory.count({
      where,
    })
  }

  async find(
    id: number,
    kwargs: Omit<Prisma.ProductCategoryFindUniqueArgs, 'where'> = {},
  ): Promise<TProductCategory> {
    return await this.prisma.productCategory.findUnique({
      ...kwargs,
      where: { id },
    })
  }

  async create(data: Prisma.ProductCategoryUncheckedCreateInput): Promise<TProductCategory> {
    const productCategory = await this.prisma.productCategory.create({
      data,
    })
    return productCategory
  }

  async update(
    id: number,
    data: Prisma.ProductCategoryUncheckedUpdateInput,
  ): Promise<TProductCategory> {
    const productCategory = await this.findOrFail(id)

    return await this.prisma.productCategory.update({
      data,
      where: { id: productCategory.id },
    })
  }

  async delete(productCategory: TProductCategory, deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.productCategory.delete({ where: { id: productCategory.id } })
      })
      return true
    } catch {
      return false
    }
  }
}
