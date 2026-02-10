import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@runtime/prisma-client'
import {
  IPrismaExportOptions,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { EnumPointSchemaTrigger } from '../enums/point-schema.enum'
import { IPointSchemaContext, TPointSchema } from '../interfaces/point-schema.interface'
import { PointSchemaUtil } from '../helpers/point-schema.util'

@Injectable()
export class PointSchemaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pointSchemaUtil: PointSchemaUtil,
  ) {}

  async getOne(kwargs: Prisma.PointSchemaFindUniqueArgs): Promise<TPointSchema> {
    return await this.prisma.pointSchema.findUnique(kwargs)
  }

  async getFirst(kwargs?: Prisma.PointSchemaFindFirstArgs): Promise<TPointSchema> {
    return await this.prisma.pointSchema.findFirst(kwargs)
  }

  async getMany(kwargs?: Prisma.PointSchemaFindManyArgs): Promise<TPointSchema[]> {
    return await this.prisma.pointSchema.findMany(kwargs)
  }

  async getList(
    kwargs: Prisma.PointSchemaFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.pointSchema.list(kwargs, options)
  }

  async getPage(
    kwargs: Prisma.PointSchemaFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.pointSchema.paginate(kwargs, options)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.PointSchemaFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TPointSchema> {
    return await this.prisma.pointSchema
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.pointSchema.notFound',
        })
      })
  }

  async create(data: Prisma.PointSchemaUncheckedCreateInput): Promise<TPointSchema> {
    const pointSchema = await this.prisma.pointSchema.create({
      data,
    })
    return pointSchema
  }

  async update(id: number, data: Prisma.PointSchemaUncheckedUpdateInput): Promise<TPointSchema> {
    const pointSchema = await this.findOrFail(id)

    return await this.prisma.pointSchema.update({
      data,
      where: { id: pointSchema.id },
    })
  }

  async delete(id: number, _deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async tx => {
        await tx.pointSchema.delete({ where: { id } })
      })
      return true
    } catch {
      return false
    }
  }

  async getAllByTrigger(trigger: EnumPointSchemaTrigger, issuedAt: Date): Promise<TPointSchema[]> {
    return this.prisma.pointSchema.findMany({
      where: {
        trigger,
        isActive: true,
        sinceDate: { lte: issuedAt },
        OR: [{ untilDate: null }, { untilDate: { gte: issuedAt } }],
      },
      include: {
        conditions: true,
        rewards: true,
        limits: true,
      },
      orderBy: { priority: 'desc' },
    })
  }

  async check(schema: TPointSchema, context: IPointSchemaContext) {
    return await this.pointSchemaUtil.canApply(schema, context)
  }
}
