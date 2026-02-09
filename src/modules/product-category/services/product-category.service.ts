import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@runtime/prisma-client'
import {
  IPrismaExportOptions,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { TProductCategory } from '../interfaces/product-category.interface'

@Injectable()
export class ProductCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getOne(kwargs: Prisma.ProductCategoryFindUniqueArgs): Promise<TProductCategory> {
    return await this.prisma.productCategory.findUnique(kwargs)
  }

  async getFirst(kwargs?: Prisma.ProductCategoryFindFirstArgs): Promise<TProductCategory> {
    return await this.prisma.productCategory.findFirst(kwargs)
  }

  async getMany(kwargs?: Prisma.ProductCategoryFindManyArgs): Promise<TProductCategory[]> {
    return await this.prisma.productCategory.findMany(kwargs)
  }

  async getList(
    kwargs: Prisma.ProductCategoryFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.productCategory.list(kwargs, options)
  }

  async getPage(
    kwargs: Prisma.ProductCategoryFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.productCategory.paginate(kwargs, options)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.ProductCategoryFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TProductCategory> {
    return await this.prisma.productCategory
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.productCategory.notFound',
        })
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

  async delete(id: number, _deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async tx => {
        await tx.productCategory.delete({ where: { id } })
      })
      return true
    } catch {
      return false
    }
  }
}
