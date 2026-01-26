import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Page, Prisma } from '@runtime/prisma-client'
import {
  IPrismaOptions,
  IPrismaParams,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { EnumPageType } from '../enums'
import { TPage } from '../interfaces'

@Injectable()
export class PageService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(kwargs?: Prisma.PageFindUniqueArgs): Promise<Page> {
    return this.prisma.page.findUnique(kwargs)
  }

  async findFirst(kwargs: Prisma.PageFindFirstArgs = {}): Promise<Page> {
    return await this.prisma.page.findFirst(kwargs)
  }

  async findAll(kwargs: Prisma.PageFindManyArgs = {}): Promise<TPage[]> {
    return await this.prisma.page.findMany(kwargs)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.PageFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TPage> {
    return await this.prisma.page
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.page.notFound',
        })
      })
  }

  async matchOrFail(
    where: Prisma.PageWhereInput,
    kwargs: Omit<Prisma.PageFindFirstOrThrowArgs, 'where'> = {},
  ): Promise<Page> {
    const page = await this.prisma.page
      .findFirstOrThrow({ ...kwargs, where })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.page.notFound',
        })
      })
    return page
  }

  async list(
    where?: Prisma.PageWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.page.list(where, params, options)
  }

  async paginate(
    where?: Prisma.PageWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.page.paginate(where, params, options)
  }

  async count(where?: Prisma.PageWhereInput): Promise<number> {
    return await this.prisma.page.count({
      where,
    })
  }

  async find(id: number, kwargs: Omit<Prisma.PageFindUniqueArgs, 'where'> = {}): Promise<Page> {
    return await this.prisma.page.findUnique({
      ...kwargs,
      where: { id },
    })
  }

  async create(data: Prisma.PageUncheckedCreateInput): Promise<TPage> {
    const created = await this.prisma.page.create({ data })
    return created
  }

  async update(id: number, data: Prisma.PageUncheckedUpdateInput): Promise<TPage> {
    const page = await this.findOrFail(id)

    const updated = await this.prisma.page.update({
      data,
      where: { id: page.id },
    })
    return updated
  }

  async delete(id: number): Promise<Page> {
    const page = await this.find(id)
    if (page) {
      const exist = await this.count({ isActive: true, type: page.type })
      if (exist <= 1) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.page.requiredOne',
        })
      }

      return await this.prisma.page.update({
        where: { id: page.id },
        data: { isActive: false },
      })

      // await this.prisma.$transaction(async (tx) => {
      //   await tx.page.delete({ where: { id: page.id } })
      //   await FileUtil.removeLink(page.thumbnail)
      // })
    }
    return page
  }

  async change(id: number, data: Prisma.PageUncheckedUpdateInput): Promise<TPage> {
    const page = await this.findOrFail(id)
    return await this.prisma.page.update({
      data,
      where: { id: page.id },
    })
  }

  async pageories(): Promise<void> {
    await this.prisma.page.createMany({
      data: Object.values(EnumPageType).map((type: string) => {
        return { type }
      }),
    })
  }
}
