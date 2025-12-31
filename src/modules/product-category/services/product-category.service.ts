import { ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@runtime/prisma-client'
import {
  IPrismaOptions,
  IPrismaParams,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { TProductCategory } from '../interfaces'

@Injectable()
export class ProductCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(kwargs?: Prisma.ProductCategoryFindUniqueArgs): Promise<TProductCategory> {
    return await this.prisma.client.productCategory.findUnique(kwargs)
  }

  async findFirst(kwargs: Prisma.ProductCategoryFindFirstArgs = {}): Promise<TProductCategory> {
    return await this.prisma.client.productCategory.findFirst(kwargs)
  }

  async findAll(kwargs: Prisma.ProductCategoryFindManyArgs = {}): Promise<TProductCategory[]> {
    return await this.prisma.client.productCategory.findMany(kwargs)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.ProductCategoryFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TProductCategory> {
    const productCategory = await this.prisma.client.productCategory
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
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
    const productCategory = await this.prisma.client.productCategory
      .findFirstOrThrow({ ...kwargs, where })
      .catch((_err: unknown) => {
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
  ): Promise<IPrismaReturnList> {
    return await this.prisma.client.productCategory.list(where, params, options)
  }

  async paginate(
    where?: Prisma.ProductCategoryWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.client.productCategory.paginate(where, params, options)
  }

  async count(where?: Prisma.ProductCategoryWhereInput): Promise<number> {
    return await this.prisma.client.productCategory.count({
      where,
    })
  }

  async find(
    id: number,
    kwargs: Omit<Prisma.ProductCategoryFindUniqueArgs, 'where'> = {},
  ): Promise<TProductCategory> {
    return await this.prisma.client.productCategory.findUnique({
      ...kwargs,
      where: { id },
    })
  }

  async create(data: Prisma.ProductCategoryUncheckedCreateInput): Promise<TProductCategory> {
    const productCategory = await this.prisma.client.productCategory.create({
      data,
    })
    return productCategory
  }

  async update(
    id: number,
    data: Prisma.ProductCategoryUncheckedUpdateInput,
  ): Promise<TProductCategory> {
    const productCategory = await this.findOrFail(id)

    return await this.prisma.client.productCategory.update({
      data,
      where: { id: productCategory.id },
    })
  }

  async delete(productCategory: TProductCategory, _deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.client.$transaction(async (tx) => {
        await tx.productCategory.delete({ where: { id: productCategory.id } })
      })
      return true
    } catch {
      return false
    }
  }
}
