import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@runtime/prisma-client'
import {
  IPrismaExportOptions,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { TMedia } from '../interfaces/media.interface'

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async getOne(kwargs: Prisma.MediaFindUniqueArgs): Promise<TMedia> {
    return await this.prisma.media.findUnique(kwargs)
  }

  async getFirst(kwargs?: Prisma.MediaFindFirstArgs): Promise<TMedia> {
    return await this.prisma.media.findFirst(kwargs)
  }

  async getMany(kwargs?: Prisma.MediaFindManyArgs): Promise<TMedia[]> {
    return await this.prisma.media.findMany(kwargs)
  }

  async getList(
    kwargs: Prisma.MediaFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.media.list(kwargs, options)
  }

  async getPage(
    kwargs: Prisma.MediaFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.media.paginate(kwargs, options)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.MediaFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TMedia> {
    return await this.prisma.media
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.media.notFound',
        })
      })
  }

  async create(data: Prisma.MediaUncheckedCreateInput): Promise<TMedia> {
    const media = await this.prisma.media.create({
      data,
    })
    return media
  }

  async update(id: number, data: Prisma.MediaUncheckedUpdateInput): Promise<TMedia> {
    const media = await this.findOrFail(id)

    return await this.prisma.media.update({
      data,
      where: { id: media.id },
    })
  }

  async delete(id: number, _deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async tx => {
        await tx.media.delete({ where: { id } })
      })
      return true
    } catch {
      return false
    }
  }
}
