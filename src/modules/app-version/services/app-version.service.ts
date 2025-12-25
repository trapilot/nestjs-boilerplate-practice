import { ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { IPrismaOptions, IPrismaParams, PrismaService } from 'lib/nest-prisma'
import { IResponseList, IResponsePaging } from 'lib/nest-web'
import { TAppVersion } from '../interfaces'

@Injectable()
export class AppVersionService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(kwargs?: Prisma.AppVersionFindUniqueArgs): Promise<TAppVersion> {
    return await this.prisma.appVersion.findUnique(kwargs)
  }

  async findFirst(kwargs: Prisma.AppVersionFindFirstArgs = {}): Promise<TAppVersion> {
    return await this.prisma.appVersion.findFirst(kwargs)
  }

  async findAll(kwargs: Prisma.AppVersionFindManyArgs = {}): Promise<TAppVersion[]> {
    return await this.prisma.appVersion.findMany(kwargs)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.AppVersionFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TAppVersion> {
    const appVersion = await this.prisma.appVersion
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.appVersion.notFound',
        })
      })
    return appVersion
  }

  async matchOrFail(
    where: Prisma.AppVersionWhereInput,
    kwargs: Omit<Prisma.AppVersionFindFirstOrThrowArgs, 'where'> = {},
  ): Promise<TAppVersion> {
    const appVersion = await this.prisma.appVersion
      .findFirstOrThrow({ ...kwargs, where })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.appVersion.notFound',
        })
      })
    return appVersion
  }

  async differOrFail(
    where: Prisma.AppVersionWhereInput,
    options?: { limit?: number; message?: string },
  ): Promise<void> {
    const totalRecords = await this.count(where)
    const limitRecords = options?.limit ?? 0
    if (totalRecords > limitRecords) {
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: options?.message ?? 'module.appVersion.conflict',
      })
    }
  }

  async list(
    where?: Prisma.AppVersionWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponseList> {
    return await this.prisma.$extension(async (ex) => {
      return await ex.appVersion.list(where, params, options)
    })
  }

  async paginate(
    where?: Prisma.AppVersionWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponsePaging> {
    return await this.prisma.$extension(async (ex) => {
      return await ex.appVersion.paginate(where, params, options)
    })
  }

  async count(where?: Prisma.AppVersionWhereInput): Promise<number> {
    return await this.prisma.appVersion.count({
      where,
    })
  }

  async find(
    id: number,
    kwargs: Omit<Prisma.AppVersionFindUniqueArgs, 'where'> = {},
  ): Promise<TAppVersion> {
    return await this.prisma.appVersion.findUnique({
      ...kwargs,
      where: { id },
    })
  }

  async create(data: Prisma.AppVersionUncheckedCreateInput): Promise<TAppVersion> {
    const appVersion = await this.prisma.appVersion.create({
      data,
    })
    return appVersion
  }

  async update(id: number, data: Prisma.AppVersionUncheckedUpdateInput): Promise<TAppVersion> {
    const appVersion = await this.findOrFail(id)

    return await this.prisma.appVersion.update({
      data,
      where: { id: appVersion.id },
    })
  }

  async inactive(id: number): Promise<TAppVersion> {
    const apiKey = await this.findOrFail(id)

    return await this.prisma.appVersion.update({
      data: { isActive: false },
      where: { id: apiKey.id },
    })
  }

  async active(id: number): Promise<TAppVersion> {
    const apiKey = await this.findOrFail(id)

    return await this.prisma.appVersion.update({
      data: { isActive: true },
      where: { id: apiKey.id },
    })
  }

  async delete(appVersion: TAppVersion, _deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.appVersion.delete({ where: { id: appVersion.id } })
      })
      return true
    } catch {
      return false
    }
  }
}
