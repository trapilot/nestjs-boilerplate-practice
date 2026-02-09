import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@runtime/prisma-client'
import {
  IPrismaExportOptions,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { TCountry } from '../interfaces/country.interface'

@Injectable()
export class CountryService {
  constructor(private readonly prisma: PrismaService) {}

  async getOne(kwargs: Prisma.CountryFindUniqueArgs): Promise<TCountry> {
    return await this.prisma.country.findUnique(kwargs)
  }

  async getFirst(kwargs?: Prisma.CountryFindFirstArgs): Promise<TCountry> {
    return await this.prisma.country.findFirst(kwargs)
  }

  async getMany(kwargs?: Prisma.CountryFindManyArgs): Promise<TCountry[]> {
    return await this.prisma.country.findMany(kwargs)
  }

  async getList(
    kwargs: Prisma.CountryFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.country.list(kwargs, options)
  }

  async getPage(
    kwargs: Prisma.CountryFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.country.paginate(kwargs, options)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.CountryFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TCountry> {
    return await this.prisma.country
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.country.notFound',
        })
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

  async delete(id: number, _deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async tx => {
        await tx.country.delete({ where: { id } })
      })
      return true
    } catch {
      return false
    }
  }
}
