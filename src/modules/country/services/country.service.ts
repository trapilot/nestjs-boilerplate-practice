import { ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { IPrismaOptions, IPrismaParams, PrismaService } from 'lib/nest-prisma'
import { IResponseList, IResponsePaging } from 'lib/nest-web'
import { TCountry } from '../interfaces'

@Injectable()
export class CountryService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(kwargs: Prisma.CountryFindUniqueArgs): Promise<TCountry> {
    return await this.prisma.country.findUnique(kwargs)
  }

  async findFirst(kwargs: Prisma.CountryFindFirstArgs = {}): Promise<TCountry> {
    return await this.prisma.country.findFirst(kwargs)
  }

  async findAll(kwargs: Prisma.CountryFindManyArgs = {}): Promise<TCountry[]> {
    return await this.prisma.country.findMany(kwargs)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.CountryFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TCountry> {
    const country = await this.prisma.country
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.country.notFound',
        })
      })
    return country
  }

  async differOrFail(
    where: Prisma.CountryWhereInput,
    options?: { limit?: number; message?: string },
  ): Promise<void> {
    const totalRecords = await this.count(where)
    const limitRecords = options?.limit ?? 0
    if (totalRecords > limitRecords) {
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: options?.message ?? 'module.country.conflict',
      })
    }
  }

  async matchOrFail(
    where: Prisma.CountryWhereInput,
    kwargs: Omit<Prisma.CountryFindFirstOrThrowArgs, 'where'> = {},
  ): Promise<TCountry> {
    const country = await this.prisma.country
      .findFirstOrThrow({ ...kwargs, where })
      .catch((err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.country.notFound',
        })
      })
    return country
  }

  async list(
    where?: Prisma.CountryWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponseList> {
    return await this.prisma.$listing(async (ex) => {
      return await ex.country.list(where, params, options)
    })
  }

  async paginate(
    where?: Prisma.CountryWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponsePaging> {
    return await this.prisma.$paginate(async (ex) => {
      return await ex.country.paginate(where, params, options)
    })
  }

  async count(where: Prisma.CountryWhereInput = {}): Promise<number> {
    return await this.prisma.country.count({
      where,
    })
  }

  async find(
    id: number,
    kwargs: Omit<Prisma.CountryFindUniqueArgs, 'where'> = {},
  ): Promise<TCountry> {
    return await this.prisma.country.findUnique({
      ...kwargs,
      where: { id },
    })
  }

  async create(data: Prisma.CountryUncheckedCreateInput): Promise<TCountry> {
    const country = await this.prisma.country.create({
      data,
    })
    return country
  }

  async update(id: number, data: Prisma.CountryUncheckedUpdateInput): Promise<TCountry> {
    const country = await this.findOrFail(id)

    return await this.prisma.country.update({
      data,
      where: { id: country.id },
    })
  }

  async delete(country: TCountry, deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.country.delete({ where: { id: country.id } })
      })
      return true
    } catch {
      return false
    }
  }
}
