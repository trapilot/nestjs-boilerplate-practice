import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@runtime/prisma-client'
import {
  IPrismaExportOptions,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { TProductBrand } from '../interfaces/product-brand.interface'

@Injectable()
export class ProductBrandService {
  constructor(private readonly prisma: PrismaService) {}

  async getOne(kwargs: Prisma.ProductBrandFindUniqueArgs): Promise<TProductBrand> {
    return await this.prisma.productBrand.findUnique(kwargs)
  }

  async getFirst(kwargs?: Prisma.ProductBrandFindFirstArgs): Promise<TProductBrand> {
    return await this.prisma.productBrand.findFirst(kwargs)
  }

  async getMany(kwargs?: Prisma.ProductBrandFindManyArgs): Promise<TProductBrand[]> {
    return await this.prisma.productBrand.findMany(kwargs)
  }

  async getList(
    kwargs?: Prisma.ProductBrandFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.productBrand.list(kwargs, options)
  }

  async getPage(
    kwargs?: Prisma.ProductBrandFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.productBrand.paginate(kwargs, options)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.ProductBrandFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TProductBrand> {
    return await this.prisma.productBrand
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.productBrand.notFound',
        })
      })
  }

  async create(data: Prisma.ProductBrandUncheckedCreateInput): Promise<TProductBrand> {
    const productBrand = await this.prisma.productBrand.create({
      data,
    })
    return productBrand
  }

  async update(id: number, data: Prisma.ProductBrandUncheckedUpdateInput): Promise<TProductBrand> {
    const productBrand = await this.findOrFail(id)

    return await this.prisma.productBrand.update({
      data,
      where: { id: productBrand.id },
    })
  }

  async delete(id: number, _deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async tx => {
        await tx.productBrand.delete({ where: { id } })
      })
      return true
    } catch {
      return false
    }
  }
}
