import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@runtime/prisma-client'
import {
  IPrismaExportOptions,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { TDistrict } from '../interfaces/district.interface'

@Injectable()
export class DistrictService {
  constructor(private readonly prisma: PrismaService) {}

  async getOne(kwargs: Prisma.DistrictFindUniqueArgs): Promise<TDistrict> {
    return await this.prisma.district.findUnique(kwargs)
  }

  async getFirst(kwargs?: Prisma.DistrictFindFirstArgs): Promise<TDistrict> {
    return await this.prisma.district.findFirst(kwargs)
  }

  async getMany(kwargs?: Prisma.DistrictFindManyArgs): Promise<TDistrict[]> {
    return await this.prisma.district.findMany(kwargs)
  }

  async getList(
    kwargs: Prisma.DistrictFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.district.list(kwargs, options)
  }

  async getPage(
    kwargs: Prisma.DistrictFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.district.paginate(kwargs, options)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.DistrictFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TDistrict> {
    return await this.prisma.district
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.district.notFound',
        })
      })
  }

  async create(data: Prisma.DistrictUncheckedCreateInput): Promise<TDistrict> {
    const district = await this.prisma.district.create({
      data,
    })
    return district
  }

  async update(id: number, data: Prisma.DistrictUncheckedUpdateInput): Promise<TDistrict> {
    const district = await this.findOrFail(id)

    return await this.prisma.district.update({
      data,
      where: { id: district.id },
    })
  }

  async delete(id: number, _deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async tx => {
        await tx.district.delete({ where: { id } })
      })
      return true
    } catch {
      return false
    }
  }
}
