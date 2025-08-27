import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Prisma, Setting } from '@prisma/client'
import { Cache } from 'cache-manager'
import { IPrismaOptions, IPrismaParams, PrismaService } from 'lib/nest-prisma'
import {
  APP_TIMEZONE,
  ENUM_DATE_FORMAT,
  HelperArrayService,
  HelperDateService,
  HelperNumberService,
  HelperStringService,
} from 'lib/nest-core'
import { IResponseList, IResponsePaging } from 'lib/nest-web'
import { ENUM_SETTING_GROUP, ENUM_SETTING_TYPE } from '../enums'

@Injectable()
export class SettingService {
  #prefix = '__cache_setting'
  private readonly timezone: string
  private readonly timezoneOffset: string

  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly helperArrayService: HelperArrayService,
    private readonly helperDateService: HelperDateService,
    private readonly helperNumberService: HelperNumberService,
    private readonly helperStringService: HelperStringService,
  ) {
    const dateNow = this.helperDateService.create()

    this.timezone = this.config.get<string>('app.timezone')
    this.timezoneOffset = this.helperDateService.format(dateNow, ENUM_DATE_FORMAT.TIMEZONE)
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timeZone: APP_TIMEZONE })
  async cleanUp(): Promise<boolean> {
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
      .catch((err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'error.setting.notFound',
        })
      })
  }

  async list(
    where?: Prisma.SettingWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponseList> {
    return await this.prisma.$listing(async (ex) => {
      return await ex.setting.list(where, params, options)
    })
  }

  async paginate(
    where?: Prisma.SettingWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponsePaging> {
    return await this.prisma.$paginate(async (ex) => {
      return await ex.setting.paginate(where, params, options)
    })
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
      return await this.prisma.$transaction(async (tx) => {
        await this.removeCache(setting.code)
        return await tx.setting.update({
          data,
          where: { id: setting.id },
        })
      })
    }
    return setting
  }

  private isArray(type: string): boolean {
    return this.helperArrayService.includes(
      [ENUM_SETTING_TYPE.ARRAY_OF_NUMBER, ENUM_SETTING_TYPE.ARRAY_OF_STRING],
      type,
    )
  }

  private isBoolean(type: string): boolean {
    return this.helperArrayService.includes(
      [ENUM_SETTING_TYPE.BOOLEAN, ENUM_SETTING_TYPE.YESNO],
      type,
    )
  }

  private isNumber(type: string): boolean {
    return ENUM_SETTING_TYPE.NUMBER == type
  }

  private getValues(value: string): any[] {
    const values = value.split(',')
    const numbers = values.filter((i) => this.helperNumberService.check(i))
    if (numbers.length == values.length) {
      return values.map((i) => parseInt(i))
    }
    return values
  }

  getValue<T>(setting: Setting): T {
    if (this.isBoolean(setting.type)) {
      return this.helperStringService.boolean(setting.value) as T
    }
    if (this.isNumber(setting.type)) {
      return this.helperNumberService.create(setting.value) as T
    }
    if (this.isArray(setting.type)) {
      return this.getValues(setting.value) as T
    }
    return setting.value as T
  }

  private createKey(code: string): string {
    return `${this.#prefix}_${code}`
  }

  private async getInstance<T>(data: Prisma.SettingUncheckedCreateInput): Promise<T> {
    const cacheKey = this.createKey(data.code)
    let cacheValue = await this.cache.get<string>(cacheKey)

    if (cacheValue == undefined) {
      const setting =
        (await this.prisma.setting.findFirst({ where: { code: data.code } })) ||
        (await this.prisma.setting.create({ data }))

      cacheValue = JSON.stringify(setting)

      await this.cache.set(cacheKey, cacheValue, 86400)
    }
    return JSON.parse(cacheValue) as T
  }

  private async getCache<T>(data: Prisma.SettingUncheckedCreateInput): Promise<T> {
    const cacheKey = this.createKey(data.code)
    let cacheValue = await this.cache.get(cacheKey)

    if (cacheValue == undefined) {
      const setting =
        (await this.prisma.setting.findFirst({ where: { code: data.code } })) ||
        (await this.prisma.setting.create({ data }))

      cacheValue = this.getValue(setting)

      await this.cache.set(cacheKey, cacheValue, 86400)
    }
    return cacheValue as T
  }

  checkValue(value: string, type: string): boolean {
    if (type === ENUM_SETTING_TYPE.BOOLEAN) {
      return this.helperArrayService.includes(['true', 'false'], value)
    }
    if (type === ENUM_SETTING_TYPE.YESNO) {
      return this.helperArrayService.includes(['yes', 'no'], value)
    }
    if (type === ENUM_SETTING_TYPE.ONOFF) {
      return this.helperArrayService.includes(['on', 'off'], value)
    }
    if (type === ENUM_SETTING_TYPE.NUMBER) {
      return this.helperNumberService.check(value)
    }
    if (type === ENUM_SETTING_TYPE.STRING) {
      return true
    }

    return false
  }

  private async removeCache(code: string): Promise<boolean> {
    try {
      await this.cache.del(this.createKey(code))
    } catch (err: unknown) {}
    return true
  }

  async getMaintenance(): Promise<boolean> {
    return await this.getCache<boolean>({
      name: 'Maintenance Mode',
      code: 'maintenance',
      description: 'Maintenance Mode',
      type: ENUM_SETTING_TYPE.BOOLEAN,
      value: 'false',
      isVisible: false,
    })
  }

  async getVersion(os: string): Promise<Setting> {
    return await this.getInstance({
      name: os,
      code: os,
      description: `${os} Version`,
      type: ENUM_SETTING_TYPE.STRING,
      value: '0.0.1',
      isVisible: true,
    })
  }

  async getOpenWork(): Promise<Setting> {
    return await this.getInstance({
      name: 'Open Work',
      code: 'open_work',
      group: ENUM_SETTING_GROUP.OPEN_WORK,
      description: 'Open Work',
      type: ENUM_SETTING_TYPE.STRING,
      value: '08:00',
      isVisible: true,
    })
  }

  async getTimezone(): Promise<string> {
    return this.timezone
  }

  async getTimezoneOffset(): Promise<string> {
    return this.timezoneOffset
  }

  async getOpenWorkTime(): Promise<string> {
    const data = await this.getOpenWork()
    return this.getValue<string>(data)
  }
}
