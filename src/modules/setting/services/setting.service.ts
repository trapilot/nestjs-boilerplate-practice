import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Prisma, Setting } from '@runtime/prisma-client'
import { HelperService } from 'lib/nest-core'
import {
  IPrismaOptions,
  IPrismaParams,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { EnumSettingType } from '../enums/setting.enum'
import { SettingUtil } from '../helpers/setting.util'

@Injectable()
export class SettingService {
  private readonly timezone: string
  private readonly timezoneOffset: string

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly helperService: HelperService,
    private readonly settingUtil: SettingUtil,
  ) {
    const nowDate = this.helperService.dateNow()

    this.timezone = this.config.get<string>('app.timezone')
    this.timezoneOffset = this.helperService.dateGetZoneOffset(nowDate)
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
    options?: IPrismaOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.setting.list(where, params, options)
  }

  async paginate(
    where?: Prisma.SettingWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
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
    const settings = await this.prisma.setting.findMany({
      where,
      select: { id: true, code: true },
    })

    for (const setting of settings) {
      try {
        await this.prisma.setting.delete({ where: { id: setting.id } })
        await this.settingUtil.removeCache(setting.code)
      } catch {}
    }

    return true
  }

  async update(id: number, data: Prisma.SettingUncheckedUpdateInput): Promise<Setting> {
    const setting = await this.findOrFail(id)
    if (setting) {
      const updated = await this.prisma.setting.update({
        data,
        where: { id: setting.id },
      })

      await this.settingUtil.removeCache(setting.code)

      return updated
    }
    return setting
  }

  async clearAllCache(): Promise<boolean> {
    const settings = await this.prisma.setting.findMany({
      select: { id: true, code: true },
    })

    settings.forEach(setting => this.settingUtil.removeCache(setting.code))

    return true
  }

  async checkValue(value: string, type: string): Promise<boolean> {
    return SettingUtil.checkDataType(value, type)
  }

  async getMaintenance(): Promise<boolean> {
    const code = 'maintenance'

    const cached = await this.settingUtil.getCache(code)
    if (cached) {
      return this.settingUtil.parseCache<boolean>(cached)
    }

    const exists = await this.prisma.setting.exists({ code })
    const maintenance = exists
      ? await this.prisma.setting.findFirst({ where: { code } })
      : await this.prisma.setting.create({
          data: {
            code,
            name: 'Maintenance Mode',
            description: 'Maintenance Mode',
            type: EnumSettingType.BOOLEAN,
            value: 'false',
            isVisible: false,
          },
        })

    const storedCache = await this.settingUtil.storeCache(maintenance.code, {
      data: { value: maintenance.value, type: maintenance.type },
      ttl: 86400,
    })
    return this.settingUtil.parseCache(storedCache)
  }

  getTimezone(): string {
    return this.timezone
  }

  getTimezoneOffset(): string {
    return this.timezoneOffset
  }
}
