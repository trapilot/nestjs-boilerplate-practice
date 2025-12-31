import { ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@runtime/prisma-client'
import {
  IPrismaOptions,
  IPrismaParams,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { TCountry } from '../interfaces'

@Injectable()
export class CountryService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(kwargs: Prisma.CountryFindUniqueArgs): Promise<TCountry> {
    return await this.prisma.client.country.findUnique(kwargs)
  }

  async findFirst(kwargs: Prisma.CountryFindFirstArgs = {}): Promise<TCountry> {
    return await this.prisma.client.country.findFirst(kwargs)
  }

  async findAll(kwargs: Prisma.CountryFindManyArgs = {}): Promise<TCountry[]> {
    return await this.prisma.client.country.findMany(kwargs)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.CountryFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TCountry> {
    const country = await this.prisma.client.country
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
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
    const country = await this.prisma.client.country
      .findFirstOrThrow({ ...kwargs, where })
      .catch((_err: unknown) => {
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
  ): Promise<IPrismaReturnList> {
    return await this.prisma.client.country.list(where, params, options)
  }

  async paginate(
    where?: Prisma.CountryWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.client.country.paginate(where, params, options)
  }

  async count(where: Prisma.CountryWhereInput = {}): Promise<number> {
    return await this.prisma.client.country.count({
      where,
    })
  }

  async find(
    id: number,
    kwargs: Omit<Prisma.CountryFindUniqueArgs, 'where'> = {},
  ): Promise<TCountry> {
    return await this.prisma.client.country.findUnique({
      ...kwargs,
      where: { id },
    })
  }

  async create(data: Prisma.CountryUncheckedCreateInput): Promise<TCountry> {
    const country = await this.prisma.client.country.create({
      data,
    })
    return country
  }

  async update(id: number, data: Prisma.CountryUncheckedUpdateInput): Promise<TCountry> {
    const country = await this.findOrFail(id)

    return await this.prisma.client.country.update({
      data,
      where: { id: country.id },
    })
  }

  async delete(country: TCountry, _deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.client.$transaction(async (tx) => {
        await tx.country.delete({ where: { id: country.id } })
      })
      return true
    } catch {
      return false
    }
  }
}
