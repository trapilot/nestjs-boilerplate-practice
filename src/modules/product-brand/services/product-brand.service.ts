import { ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { IPrismaOptions, IPrismaParams, PrismaService } from 'lib/nest-prisma'
import { IResponseList, IResponsePaging } from 'lib/nest-web'
import { TProductBrand } from '../interfaces'

@Injectable()
export class ProductBrandService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(kwargs?: Prisma.ProductBrandFindUniqueArgs): Promise<TProductBrand> {
    return await this.prisma.productBrand.findUnique(kwargs)
  }

  async findFirst(kwargs: Prisma.ProductBrandFindFirstArgs = {}): Promise<TProductBrand> {
    return await this.prisma.productBrand.findFirst(kwargs)
  }

  async findAll(kwargs: Prisma.ProductBrandFindManyArgs = {}): Promise<TProductBrand[]> {
    return await this.prisma.productBrand.findMany(kwargs)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.ProductBrandFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TProductBrand> {
    const productBrand = await this.prisma.productBrand
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.productBrand.notFound',
        })
      })
    return productBrand
  }

  async matchOrFail(
    where: Prisma.ProductBrandWhereInput,
    kwargs: Omit<Prisma.ProductBrandFindFirstOrThrowArgs, 'where'> = {},
  ): Promise<TProductBrand> {
    const productBrand = await this.prisma.productBrand
      .findFirstOrThrow({ ...kwargs, where })
      .catch((err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.productBrand.notFound',
        })
      })
    return productBrand
  }

  async differOrFail(
    where: Prisma.ProductBrandWhereInput,
    options?: { limit?: number; message?: string },
  ): Promise<void> {
    const totalRecords = await this.count(where)
    const limitRecords = options?.limit ?? 0
    if (totalRecords > limitRecords) {
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: options?.message ?? 'module.productBrand.conflict',
      })
    }
  }

  async list(
    where?: Prisma.ProductBrandWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponseList> {
    return await this.prisma.$listing(async (ex) => {
      return await ex.productBrand.list(where, params, options)
    })
  }

  async paginate(
    where?: Prisma.ProductBrandWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponsePaging> {
    return await this.prisma.$paginate(async (ex) => {
      return await ex.productBrand.paginate(where, params, options)
    })
  }

  async count(where?: Prisma.ProductBrandWhereInput): Promise<number> {
    return await this.prisma.productBrand.count({
      where,
    })
  }

  async find(
    id: number,
    kwargs: Omit<Prisma.ProductBrandFindUniqueArgs, 'where'> = {},
  ): Promise<TProductBrand> {
    return await this.prisma.productBrand.findUnique({
      ...kwargs,
      where: { id },
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

  async delete(productBrand: TProductBrand, deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.productBrand.delete({ where: { id: productBrand.id } })
      })
      return true
    } catch {
      return false
    }
  }
}
