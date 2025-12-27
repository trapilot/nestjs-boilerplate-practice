import { ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Prisma } from '@runtime/prisma-client'
import { CryptoService, ENUM_APP_ENVIRONMENT, HelperService } from 'lib/nest-core'
import { IPrismaOptions, IPrismaParams, PrismaService } from 'lib/nest-prisma'
import { IResponseList, IResponsePaging } from 'lib/nest-web'
import { TApiKey } from '../interfaces'

@Injectable()
export class ApiKeyService {
  private readonly appEnv: ENUM_APP_ENVIRONMENT

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly cryptoService: CryptoService,
    private readonly helperService: HelperService,
  ) {
    this.appEnv = config.get<ENUM_APP_ENVIRONMENT>('app.env')
  }

  async findOne(kwargs?: Prisma.ApiKeyFindUniqueArgs): Promise<TApiKey> {
    return await this.prisma.apiKey.findUnique(kwargs)
  }

  async findFirst(kwargs: Prisma.ApiKeyFindFirstArgs = {}): Promise<TApiKey> {
    return await this.prisma.apiKey.findFirst(kwargs)
  }

  async findAll(kwargs: Prisma.ApiKeyFindManyArgs = {}): Promise<TApiKey[]> {
    return await this.prisma.apiKey.findMany(kwargs)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.ApiKeyFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TApiKey> {
    const apiKey = await this.prisma.apiKey
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.apiKey.notFound',
        })
      })
    return apiKey
  }

  async matchOrFail(
    where: Prisma.ApiKeyWhereInput,
    kwargs: Omit<Prisma.ApiKeyFindFirstOrThrowArgs, 'where'> = {},
  ): Promise<TApiKey> {
    const apiKey = await this.prisma.apiKey
      .findFirstOrThrow({ ...kwargs, where })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.apiKey.notFound',
        })
      })
    return apiKey
  }

  async differOrFail(
    where: Prisma.ApiKeyWhereInput,
    options?: { limit?: number; message?: string },
  ): Promise<void> {
    const totalRecords = await this.count(where)
    const limitRecords = options?.limit ?? 0
    if (totalRecords > limitRecords) {
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: options?.message ?? 'module.apiKey.conflict',
      })
    }
  }

  async list(
    where?: Prisma.ApiKeyWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponseList> {
    return await this.prisma.$extension(async (ex) => {
      return await ex.apiKey.list(where, params, options)
    })
  }

  async paginate(
    where?: Prisma.ApiKeyWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponsePaging> {
    return await this.prisma.$extension(async (ex) => {
      return await ex.apiKey.paginate(where, params, options)
    })
  }

  async count(where?: Prisma.ApiKeyWhereInput): Promise<number> {
    return await this.prisma.apiKey.count({
      where,
    })
  }

  async find(
    id: number,
    kwargs: Omit<Prisma.ApiKeyFindUniqueArgs, 'where'> = {},
  ): Promise<TApiKey> {
    return await this.prisma.apiKey.findUnique({
      ...kwargs,
      where: { id },
    })
  }

  async create(data: Prisma.ApiKeyUncheckedCreateInput): Promise<TApiKey> {
    const apiKey = await this.prisma.apiKey.create({
      data,
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

  async delete(apiKey: TApiKey, _deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.apiKey.delete({ where: { id: apiKey.id } })
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

  private async createKey(): Promise<string> {
    const random: string = this.helperService.randomString(25)
    return `${this.appEnv}_${random}`
  }

  private async createSecret(): Promise<string> {
    return this.helperService.randomString(35)
  }

  async resetHashApiKey(id: number): Promise<TApiKey> {
    const apiKey = await this.findOrFail(id)

    const secret: string = await this.createSecret()
    const hash = this.cryptoService.createHash(`${apiKey.key}:${secret}`, {
      algorithm: 'sha256',
    })

    const updated = await this.prisma.apiKey.update({
      data: { hash },
      where: { id: apiKey.id },
    })

    return updated
  }

  async createHashApiKey(): Promise<{ key: string; hash: string }> {
    const key = await this.createKey()
    const secret = await this.createSecret()

    const hash = this.cryptoService.createHash(`${key}:${secret}`, {
      algorithm: 'sha256',
    })
    return { key, hash }
  }
}
