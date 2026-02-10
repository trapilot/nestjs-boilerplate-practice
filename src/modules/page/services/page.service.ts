import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Page, Prisma } from '@runtime/prisma-client'
import {
  IPrismaExportOptions,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { EnumPageType } from '../enums/page.enum'
import { TPage } from '../interfaces/page.interface'

@Injectable()
export class PageService {
  constructor(private readonly prisma: PrismaService) {}

  async getOne(kwargs: Prisma.PageFindUniqueArgs): Promise<Page> {
    return this.prisma.page.findUnique(kwargs)
  }

  async getFirst(kwargs?: Prisma.PageFindFirstArgs): Promise<Page> {
    return await this.prisma.page.findFirst(kwargs)
  }

  async getMany(kwargs?: Prisma.PageFindManyArgs): Promise<Page[]> {
    return await this.prisma.page.findMany(kwargs)
  }

  async getList(
    kwargs: Prisma.PageFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.page.list(kwargs, options)
  }

  async getPage(
    kwargs: Prisma.PageFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.page.paginate(kwargs, options)
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
    const page = await this.getOne({ where: { id } })
    if (page) {
      const exists = await this.prisma.page.exists({ where: { isActive: true, type: page.type } })
      if (exists) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.page.requiredOne',
        })
      }

      return await this.prisma.page.update({
        where: { id: page.id },
        data: { isActive: false },
      })
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
