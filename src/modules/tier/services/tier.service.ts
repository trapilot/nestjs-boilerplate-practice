import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { IPrismaOptions, IPrismaParams, PrismaService } from 'lib/nest-prisma'
import { IResponseList, IResponsePaging } from 'lib/nest-web'
import { TierChartIterator } from '../helpers'
import { TTier } from '../interfaces'

@Injectable()
export class TierService implements OnModuleInit {
  private chartIterator: TierChartIterator

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const tierCharts = await this.findAll({
      include: { charts: true },
    })
    this.chartIterator = new TierChartIterator(tierCharts)
  }

  getChartIterator(): TierChartIterator {
    return this.chartIterator
  }

  async findOne(kwargs?: Prisma.TierFindUniqueArgs): Promise<TTier> {
    return await this.prisma.tier.findUnique(kwargs)
  }

  async findFirst(kwargs: Prisma.TierFindFirstArgs = {}): Promise<TTier> {
    return await this.prisma.tier.findFirst(kwargs)
  }

  async findAll(kwargs: Prisma.TierFindManyArgs = {}): Promise<TTier[]> {
    return await this.prisma.tier.findMany(kwargs)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.TierFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TTier> {
    const tier = await this.prisma.tier
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.tier.notFound',
        })
      })
    return tier
  }

  async differOrFail(
    where: Prisma.TierWhereInput,
    options?: { limit?: number; message?: string },
  ): Promise<void> {
    const totalRecords = await this.count(where)
    const limitRecords = options?.limit ?? 0
    if (totalRecords > limitRecords) {
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: options?.message ?? 'module.tier.conflict',
      })
    }
  }

  async matchOrFail(
    where: Prisma.TierWhereInput,
    kwargs: Omit<Prisma.TierFindFirstOrThrowArgs, 'where'> = {},
  ): Promise<TTier> {
    const tier = await this.prisma.tier
      .findFirstOrThrow({ ...kwargs, where })
      .catch((err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.tier.notFound',
        })
      })
    return tier
  }

  async list(
    where?: Prisma.TierWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponseList> {
    return await this.prisma.$extension(async (ex) => {
      return await ex.tier.list(where, params, options)
    })
  }

  async paginate(
    where?: Prisma.TierWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponsePaging> {
    return await this.prisma.$extension(async (ex) => {
      return await ex.tier.paginate(where, params, options)
    })
  }

  async count(where?: Prisma.TierWhereInput): Promise<number> {
    return await this.prisma.tier.count({
      where,
    })
  }

  async find(id: number, kwargs: Omit<Prisma.TierFindUniqueArgs, 'where'> = {}): Promise<TTier> {
    return await this.prisma.tier.findUnique({
      ...kwargs,
      where: { id },
    })
  }

  async create(data: Prisma.TierUncheckedCreateInput): Promise<TTier> {
    const tier = await this.prisma.tier.create({
      data,
    })
    return tier
  }

  async update(id: number, data: Prisma.TierUncheckedUpdateInput): Promise<TTier> {
    const tier = await this.findOrFail(id)

    return await this.prisma.tier.update({
      data,
      where: { id: tier.id },
    })
  }

  async delete(tier: TTier, deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.tier.delete({ where: { id: tier.id } })
      })
      return true
    } catch {
      return false
    }
  }
}
