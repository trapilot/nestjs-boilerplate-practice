import { ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@runtime/prisma-client'
import { IPrismaOptions, IPrismaParams, PrismaService } from 'lib/nest-prisma'
import { IResponseList, IResponsePaging } from 'lib/nest-web'
import { TMedia } from '../interfaces'

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(kwargs?: Prisma.MediaFindUniqueArgs): Promise<TMedia> {
    return await this.prisma.media.findUnique(kwargs)
  }

  async findFirst(kwargs: Prisma.MediaFindFirstArgs = {}): Promise<TMedia> {
    return await this.prisma.media.findFirst(kwargs)
  }

  async findAll(kwargs: Prisma.MediaFindManyArgs = {}): Promise<TMedia[]> {
    return await this.prisma.media.findMany(kwargs)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.MediaFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TMedia> {
    const media = await this.prisma.media
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.media.notFound',
        })
      })
    return media
  }

  async matchOrFail(
    where: Prisma.MediaWhereInput,
    kwargs: Omit<Prisma.MediaFindFirstOrThrowArgs, 'where'> = {},
  ): Promise<TMedia> {
    const media = await this.prisma.media
      .findFirstOrThrow({ ...kwargs, where })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.media.notFound',
        })
      })
    return media
  }

  async differOrFail(
    where: Prisma.MediaWhereInput,
    options?: { limit?: number; message?: string },
  ): Promise<void> {
    const totalRecords = await this.count(where)
    const limitRecords = options?.limit ?? 0
    if (totalRecords > limitRecords) {
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: options?.message ?? 'module.media.conflict',
      })
    }
  }

  async list(
    where?: Prisma.MediaWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponseList> {
    return await this.prisma.$extension(async (ex) => {
      return await ex.media.list(where, params, options)
    })
  }

  async paginate(
    where?: Prisma.MediaWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponsePaging> {
    return await this.prisma.$extension(async (ex) => {
      return await ex.media.paginate(where, params, options)
    })
  }

  async count(where?: Prisma.MediaWhereInput): Promise<number> {
    return await this.prisma.media.count({
      where,
    })
  }

  async find(id: number, kwargs: Omit<Prisma.MediaFindUniqueArgs, 'where'> = {}): Promise<TMedia> {
    return await this.prisma.media.findUnique({
      ...kwargs,
      where: { id },
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

  async delete(media: TMedia, _deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.media.delete({ where: { id: media.id } })
      })
      return true
    } catch {
      return false
    }
  }
}
