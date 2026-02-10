import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@runtime/prisma-client'
import { HelperService } from 'lib/nest-core'
import {
  IPrismaExportOptions,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { TProduct } from '../interfaces/product.interface'

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService,
  ) {}

  async getOne(kwargs: Prisma.ProductFindUniqueArgs): Promise<TProduct> {
    return await this.prisma.product.findUnique(kwargs)
  }

  async getFirst(kwargs?: Prisma.ProductFindFirstArgs): Promise<TProduct> {
    return await this.prisma.product.findFirst(kwargs)
  }

  async getMany(kwargs?: Prisma.ProductFindManyArgs): Promise<TProduct[]> {
    return await this.prisma.product.findMany(kwargs)
  }

  async getList(
    kwargs: Prisma.ProductFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.product.list(kwargs, options)
  }

  async getPage(
    kwargs: Prisma.ProductFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.product.paginate(kwargs, options)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.ProductFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TProduct> {
    return await this.prisma.product
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.product.notFound',
        })
      })
  }

  async create(
    data: Prisma.ProductUncheckedCreateInput,
    kwargs: Omit<Prisma.ProductFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TProduct> {
    const created = await this.prisma.product.create({ ...kwargs, data })
    return created
  }

  async update(
    id: number,
    data: Prisma.ProductUncheckedUpdateInput,
    kwargs: Omit<Prisma.ProductFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TProduct> {
    const product = await this.findOrFail(id)

    const updated = await this.prisma.product.update({
      ...kwargs,
      where: { id: product.id },
      data,
    })
    return updated
  }

  async delete(id: number, deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.product.update({
        where: { id },
        data: {
          isActive: false,
          isDeleted: true,
          deletedBy,
          deletedAt: this.helperService.dateNow(),
        },
      })
      return true
    } catch {
      return false
    }
  }

  async addWishlist(_id: number, _memberId: number): Promise<boolean> {
    return true
  }

  async getSalePerPerson(id: number, memberId: number): Promise<number> {
    const salePerPerson = await this.prisma.orderItem.aggregate({
      _sum: { quantity: true },
      where: {
        productId: id,
        order: { memberId },
      },
    })
    return salePerPerson._sum.quantity || 0
  }
}
