import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Prisma } from '@runtime/prisma-client'
import { EnumAppEnvironment, HelperService } from 'lib/nest-core'
import {
  IPrismaExportOptions,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { ApiKeyUtil } from '../helpers/api-key.util'
import { TApiKey } from '../interfaces/api-key.interface'

@Injectable()
export class ApiKeyService {
  private readonly appEnv: EnumAppEnvironment
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService,
    private readonly apiKeyUtil: ApiKeyUtil,
  ) {
    this.appEnv = this.config.get<EnumAppEnvironment>('app.env')
  }

  async getOne(kwargs: Prisma.ApiKeyFindUniqueArgs): Promise<TApiKey> {
    return await this.prisma.apiKey.findUnique(kwargs)
  }

  async getFirst(kwargs?: Prisma.ApiKeyFindFirstArgs): Promise<TApiKey> {
    return await this.prisma.apiKey.findFirst(kwargs)
  }

  async getMany(kwargs?: Prisma.ApiKeyFindManyArgs): Promise<TApiKey[]> {
    return await this.prisma.apiKey.findMany(kwargs)
  }

  async getList(
    kwargs: Prisma.ApiKeyFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.apiKey.list(kwargs, options)
  }

  async getPage(
    kwargs: Prisma.ApiKeyFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.apiKey.paginate(kwargs, options)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.ApiKeyFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TApiKey> {
    return await this.prisma.apiKey
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.apiKey.notFound',
        })
      })
  }

  async create(data: Omit<Prisma.ApiKeyUncheckedCreateInput, 'key' | 'hash'>): Promise<TApiKey> {
    const { key, hash } = this.apiKeyUtil.createHash(this.appEnv)
    const apiKey = await this.prisma.apiKey.create({
      data: { ...data, key, hash },
    })
    return apiKey
  }

  async update(id: number, data: Prisma.ApiKeyUncheckedUpdateInput): Promise<TApiKey> {
    const apiKey = await this.findOrFail(id)

    return await this.prisma.apiKey.update({
      data,
      where: { id: apiKey.id },
    })
  }

  async inactive(id: number): Promise<TApiKey> {
    const apiKey = await this.findOrFail(id)

    return await this.prisma.apiKey.update({
      data: { isActive: false },
      where: { id: apiKey.id },
    })
  }

  async active(id: number): Promise<TApiKey> {
    const apiKey = await this.findOrFail(id)

    return await this.prisma.apiKey.update({
      data: { isActive: true },
      where: { id: apiKey.id },
    })
  }

  async delete(id: number, _deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async tx => {
        await tx.apiKey.delete({ where: { id } })
      })
      return true
    } catch {
      return false
    }
  }

  async renew(apiKey: TApiKey, date: { startDate: Date; untilDate: Date }): Promise<TApiKey> {
    const startDate = this.helperService.dateCreate(date.startDate, { startOfDay: true })
    const untilDate = this.helperService.dateCreate(date.untilDate, { endOfDay: true })

    return await this.prisma.apiKey.update({
      data: { startDate, untilDate },
      where: { id: apiKey.id },
    })
  }

  async reset(id: number): Promise<TApiKey> {
    const apiKey = await this.findOrFail(id)

    const hash = this.apiKeyUtil.resetHash(apiKey.key)

    const updated = await this.prisma.apiKey.update({
      data: { hash },
      where: { id: apiKey.id },
    })

    return updated
  }
}
