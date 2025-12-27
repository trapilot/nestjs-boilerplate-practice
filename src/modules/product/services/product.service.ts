import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common'
import { Prisma } from '@runtime/prisma-client'
import { HelperService } from 'lib/nest-core'
import { IPrismaOptions, IPrismaParams, PrismaService } from 'lib/nest-prisma'
import { IResponseList, IResponsePaging } from 'lib/nest-web'
import { TProduct } from '../interfaces'

@Injectable()
export class ProductService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService,
  ) {}

  onModuleInit() {}

  async findOne(kwargs?: Prisma.ProductFindUniqueArgs): Promise<TProduct> {
    return await this.prisma.product.findUnique(kwargs)
  }

  async findFirst(kwargs: Prisma.ProductFindFirstArgs = {}): Promise<TProduct> {
    return await this.prisma.product.findFirst(kwargs)
  }

  async findAll(kwargs: Prisma.ProductFindManyArgs = {}): Promise<TProduct[]> {
    return await this.prisma.product.findMany(kwargs)
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

  async differOrFail(
    where: Prisma.ProductWhereInput,
    options?: { limit?: number; message?: string },
  ): Promise<void> {
    const totalRecords = await this.count(where)
    const limitRecords = options?.limit ?? 0
    if (totalRecords > limitRecords) {
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: options?.message ?? 'module.product.conflict',
      })
    }
  }

  async list(
    where?: Prisma.ProductWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponseList> {
    return await this.prisma.$extension(async (ex) => {
      return await ex.product.list(where, params, options)
    })
  }

  async paginate(
    where?: Prisma.ProductWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponsePaging> {
    return await this.prisma.$extension(async (ex) => {
      return await ex.product.paginate(where, params, options)
    })
  }

  async count(where?: Prisma.ProductWhereInput): Promise<number> {
    return await this.prisma.product.count({
      where,
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
          deletedAt: this.helperService.dateCreate(),
        },
      })
      return true
    } catch {
      return false
    }
  }

  async addWishlist(id: number, memberId: number): Promise<boolean> {
    const product = await this.findOrFail(id)

    const _where: Prisma.WishlistWhereUniqueInput = {
      memberId_productId: {
        memberId,
        productId: product.id,
      },
    }

    const wishList = await this.prisma.wishlist.findUnique({ where: _where })
    if (wishList) {
      await this.prisma.wishlist.delete({ where: _where })
      return false
    }

    await this.prisma.wishlist.create({ data: { memberId, productId: product.id } })
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
