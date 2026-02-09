import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@runtime/prisma-client'
import {
  IPrismaExportOptions,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { TAppVersion } from '../interfaces/app-version.interface'

@Injectable()
export class AppVersionService {
  constructor(private readonly prisma: PrismaService) {}

  async getOne(kwargs: Prisma.AppVersionFindUniqueArgs): Promise<TAppVersion> {
    return await this.prisma.appVersion.findUnique(kwargs)
  }

  async getFirst(kwargs?: Prisma.AppVersionFindFirstArgs): Promise<TAppVersion> {
    return await this.prisma.appVersion.findFirst(kwargs)
  }

  async getMany(kwargs?: Prisma.AppVersionFindManyArgs): Promise<TAppVersion[]> {
    return await this.prisma.appVersion.findMany(kwargs)
  }

  async getList(
    kwargs: Prisma.AppVersionFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.appVersion.list(kwargs, options)
  }

  async getPage(
    kwargs: Prisma.AppVersionFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.appVersion.paginate(kwargs, options)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.AppVersionFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TAppVersion> {
    return await this.prisma.appVersion
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.appVersion.notFound',
        })
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

  async deleteMany(where?: Prisma.AppVersionWhereInput): Promise<boolean> {
    await this.prisma.appVersion.deleteMany({ where })
    return true
  }

  async delete(id: number, _deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async tx => {
        await tx.appVersion.delete({ where: { id } })
      })
      return true
    } catch {
      return false
    }
  }
}
