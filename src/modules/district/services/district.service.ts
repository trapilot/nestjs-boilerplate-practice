import { ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { IPrismaOptions, IPrismaParams, PrismaService } from 'lib/nest-prisma'
import { IResponseList, IResponsePaging } from 'lib/nest-web'
import { TDistrict } from '../interfaces'

@Injectable()
export class DistrictService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(kwargs?: Prisma.DistrictFindUniqueArgs): Promise<TDistrict> {
    return await this.prisma.district.findUnique(kwargs)
  }

  async findFirst(kwargs: Prisma.DistrictFindFirstArgs = {}): Promise<TDistrict> {
    return await this.prisma.district.findFirst(kwargs)
  }

  async findAll(kwargs: Prisma.DistrictFindManyArgs = {}): Promise<TDistrict[]> {
    return await this.prisma.district.findMany(kwargs)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.DistrictFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TDistrict> {
    const district = await this.prisma.district
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.district.notFound',
        })
      })
    return district
  }

  async differOrFail(
    where: Prisma.DistrictWhereInput,
    options?: { limit?: number; message?: string },
  ): Promise<void> {
    const totalRecords = await this.count(where)
    const limitRecords = options?.limit ?? 0
    if (totalRecords > limitRecords) {
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: options?.message ?? 'module.district.conflict',
      })
    }
  }

  async matchOrFail(
    where: Prisma.DistrictWhereInput,
    kwargs: Omit<Prisma.DistrictFindFirstOrThrowArgs, 'where'> = {},
  ): Promise<TDistrict> {
    const district = await this.prisma.district
      .findFirstOrThrow({ ...kwargs, where })
      .catch((err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.district.notFound',
        })
      })
    return district
  }

  async list(
    where?: Prisma.DistrictWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponseList> {
    return await this.prisma.$extension(async (ex) => {
      return await ex.district.list(where, params, options)
    })
  }

  async paginate(
    where?: Prisma.DistrictWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponsePaging> {
    return await this.prisma.$extension(async (ex) => {
      return await ex.district.paginate(where, params, options)
    })
  }

  async count(where?: Prisma.DistrictWhereInput): Promise<number> {
    return await this.prisma.district.count({
      where,
    })
  }

  async find(
    id: number,
    kwargs: Omit<Prisma.DistrictFindUniqueArgs, 'where'> = {},
  ): Promise<TDistrict> {
    return await this.prisma.district.findUnique({
      ...kwargs,
      where: { id },
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

  async delete(district: TDistrict, deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.district.delete({ where: { id: district.id } })
      })
      return true
    } catch {
      return false
    }
  }
}
