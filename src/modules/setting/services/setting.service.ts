import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Prisma, Setting } from '@runtime/prisma-client'
import { CacheService, HelperService } from 'lib/nest-core'
import {
  IPrismaOptions,
  IPrismaParams,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { EnumSettingType } from '../enums'

@Injectable()
export class SettingService {
  #prefix = '__cache_setting'
  private readonly timezone: string
  private readonly timezoneOffset: string

  constructor(
    private readonly cache: CacheService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly helperService: HelperService
  ) {
    const nowDate = this.helperService.dateNow()

    this.timezone = this.config.get<string>('app.timezone')
    this.timezoneOffset = this.helperService.dateGetZoneOffset(nowDate)
  }

  async clearCache(): Promise<boolean> {
    try {
      const cacheSettings = await this.prisma.setting.findMany({
        select: { code: true },
      })

      for (const setting of cacheSettings) {
        const key = this.createKey(setting.code)
        await this.cache.del(key)
      }
    } catch {}
    return true
  }

  async findOne(where: Prisma.SettingWhereUniqueInput): Promise<Setting> {
    return this.prisma.setting.findUnique({ where })
  }

  async findFirst(where: Prisma.SettingWhereInput): Promise<Setting> {
    return await this.prisma.setting.findFirst({ where })
  }

  async findAll(where?: Prisma.SettingWhereInput): Promise<Setting[]> {
    return await this.prisma.setting.findMany({ where })
  }

  async findOrFail(id: number): Promise<Setting> {
    return await this.prisma.setting
      .findUniqueOrThrow({ where: { id: id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'error.setting.notFound',
        })
      })
  }

  async list(
    where?: Prisma.SettingWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions
  ): Promise<IPrismaReturnList> {
    return await this.prisma.setting.list(where, params, options)
  }

  async paginate(
    where?: Prisma.SettingWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.setting.paginate(where, params, options)
  }

  async match(where: Prisma.SettingWhereInput): Promise<Setting> {
    const setting = await this.prisma.setting.findFirst({ where })
    return setting
  }

  async count(where?: Prisma.SettingWhereInput): Promise<number> {
    return await this.prisma.setting.count({
      where,
    })
  }

  async create(data: Prisma.SettingUncheckedCreateInput): Promise<Setting> {
    return await this.prisma.setting.create({ data })
  }

  async deleteMany(where?: Prisma.SettingWhereInput): Promise<boolean> {
    await this.prisma.setting.deleteMany({ where })
    return true
  }

  async update(id: number, data: Prisma.SettingUncheckedUpdateInput): Promise<Setting> {
    const setting = await this.findOrFail(id)
    if (setting) {
      return await this.prisma.$transaction(async tx => {
        await this.removeCache(setting.code)
        return await tx.setting.update({
          data,
          where: { id: setting.id },
        })
      })
    }
    return setting
  }

  private isArray(type: EnumSettingType): boolean {
    return [EnumSettingType.ARRAY_OF_NUMBER, EnumSettingType.ARRAY_OF_STRING].includes(type)
  }

  private isBoolean(type: EnumSettingType): boolean {
    return [EnumSettingType.BOOLEAN, EnumSettingType.YESNO].includes(type)
  }

  private isNumber(type: EnumSettingType): boolean {
    return EnumSettingType.NUMBER === type
  }

  private getValueBoolean(value: string): boolean {
    return ['1', 'y', 'yes', 'ok', 'true'].includes(value.toLowerCase())
  }

  private getValueArray<T>(value: string): T[] {
    const values = value.split(',')
    const numbers = values.filter(i => this.helperService.checkNumberString(i))
    if (numbers.length === values.length) {
      return values.map(i => parseInt(i)) as T[]
    }
    return values as T[]
  }

  getValue<T>(setting: Setting): T {
    const type = setting.type as EnumSettingType
    if (this.isBoolean(type)) {
      return this.getValueBoolean(setting.value) as T
    }
    if (this.isNumber(type)) {
      return Number(setting.value) as T
    }
    if (this.isArray(type)) {
      return this.getValueArray(setting.value) as T
    }
    return setting.value as T
  }

  private createKey(code: string): string {
    return `${this.#prefix}_${code}`
  }

  private async getInstance<T>(data: Prisma.SettingUncheckedCreateInput): Promise<T> {
    const cacheKey = this.createKey(data.code)
    let cacheValue = await this.cache.get<string>(cacheKey)

    if (cacheValue === undefined) {
      const setting =
        (await this.prisma.setting.findFirst({ where: { code: data.code } })) ||
        (await this.prisma.setting.create({ data }))

      cacheValue = JSON.stringify(setting)

      await this.cache.set(cacheKey, cacheValue, 86400)
    }
    return JSON.parse(cacheValue) as T
  }

  private async getFromCache<T>(data: Prisma.SettingUncheckedCreateInput): Promise<T> {
    const cacheKey = this.createKey(data.code)
    let cacheValue = await this.cache.get(cacheKey)

    if (cacheValue === undefined) {
      const setting =
        (await this.prisma.setting.findFirst({ where: { code: data.code } })) ||
        (await this.prisma.setting.create({ data }))

      cacheValue = this.getValue(setting)

      await this.cache.set(cacheKey, cacheValue, 86400)
    }
    return cacheValue as T
  }

  checkValue(value: string, type: string): boolean {
    if (type === EnumSettingType.BOOLEAN) {
      return ['true', 'false'].includes(value)
    }
    if (type === EnumSettingType.YESNO) {
      return ['yes', 'no'].includes(value)
    }
    if (type === EnumSettingType.ONOFF) {
      return ['on', 'off'].includes(value)
    }
    if (type === EnumSettingType.NUMBER) {
      return this.helperService.checkNumberString(value)
    }
    if (type === EnumSettingType.STRING) {
      return true
    }

    return false
  }

  private async removeCache(code: string): Promise<boolean> {
    try {
      await this.cache.del(this.createKey(code))
    } catch (_err: unknown) {}
    return true
  }

  async getMaintenance(): Promise<boolean> {
    return await this.getFromCache<boolean>({
      name: 'Maintenance Mode',
      code: 'maintenance',
      description: 'Maintenance Mode',
      type: EnumSettingType.BOOLEAN,
      value: 'false',
      isVisible: false,
    })
  }

  async getVersion(os: string): Promise<Setting> {
    return await this.getInstance({
      name: os,
      code: os,
      description: `${os} Version`,
      type: EnumSettingType.STRING,
      value: '0.0.1',
      isVisible: true,
    })
  }

  async getTimezone(): Promise<string> {
    return this.timezone
  }

  async getTimezoneOffset(): Promise<string> {
    return this.timezoneOffset
  }
}
