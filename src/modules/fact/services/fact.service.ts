import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Fact, Prisma } from '@runtime/prisma-client'
import {
  IPrismaOptions,
  IPrismaParams,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { EnumFactType } from '../enums'
import { TFact } from '../interfaces'

@Injectable()
export class FactService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(kwargs?: Prisma.FactFindUniqueArgs): Promise<Fact> {
    return this.prisma.fact.findUnique(kwargs)
  }

  async findFirst(kwargs: Prisma.FactFindFirstArgs = {}): Promise<Fact> {
    return await this.prisma.fact.findFirst(kwargs)
  }

  async findAll(kwargs: Prisma.FactFindManyArgs = {}): Promise<TFact[]> {
    return await this.prisma.fact.findMany(kwargs)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.FactFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TFact> {
    return await this.prisma.fact
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.fact.notFound',
        })
      })
  }

  async matchOrFail(
    where: Prisma.FactWhereInput,
    kwargs: Omit<Prisma.FactFindFirstOrThrowArgs, 'where'> = {},
  ): Promise<Fact> {
    const fact = await this.prisma.fact
      .findFirstOrThrow({ ...kwargs, where })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.fact.notFound',
        })
      })
    return fact
  }

  async list(
    where?: Prisma.FactWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.fact.list(where, params, options)
  }

  async paginate(
    where?: Prisma.FactWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.fact.paginate(where, params, options)
  }

  async count(where?: Prisma.FactWhereInput): Promise<number> {
    return await this.prisma.fact.count({
      where,
    })
  }

  async find(id: number, kwargs: Omit<Prisma.FactFindUniqueArgs, 'where'> = {}): Promise<Fact> {
    return await this.prisma.fact.findUnique({
      ...kwargs,
      where: { id },
    })
  }

  async create(data: Prisma.FactUncheckedCreateInput): Promise<TFact> {
    const created = await this.prisma.fact.create({ data })
    return created
  }

  async update(id: number, data: Prisma.FactUncheckedUpdateInput): Promise<TFact> {
    const fact = await this.findOrFail(id)

    const updated = await this.prisma.fact.update({
      data,
      where: { id: fact.id },
    })
    return updated
  }

  async delete(id: number): Promise<Fact> {
    const fact = await this.find(id)
    if (fact) {
      const exist = await this.count({ isActive: true, type: fact.type })
      if (exist <= 1) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.fact.requiredOne',
        })
      }

      return await this.prisma.fact.update({
        where: { id: fact.id },
        data: { isActive: false },
      })

      // await this.prisma.$transaction(async (tx) => {
      //   await tx.fact.delete({ where: { id: fact.id } })
      //   await FileUtil.removeLink(fact.thumbnail)
      // })
    }
    return fact
  }

  async change(id: number, data: Prisma.FactUncheckedUpdateInput): Promise<TFact> {
    const fact = await this.findOrFail(id)
    return await this.prisma.fact.update({
      data,
      where: { id: fact.id },
    })
  }

  async factories(): Promise<void> {
    await this.prisma.fact.createMany({
      data: Object.values(EnumFactType).map((type: string) => {
        return { type }
      }),
    })
  }
}
