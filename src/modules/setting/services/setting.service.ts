import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Prisma } from '@runtime/prisma-client'
import { HelperService } from 'lib/nest-core'
import {
  IPrismaExportOptions,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { EnumSettingType } from '../enums/setting.enum'
import { SettingUtil } from '../helpers/setting.util'
import { TSetting } from '../interfaces/setting.interface'

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

  async getOne(kwargs: Prisma.SettingFindUniqueArgs): Promise<TSetting> {
    return this.prisma.setting.findUnique(kwargs)
  }

  async getFirst(kwargs?: Prisma.SettingFindFirstArgs): Promise<TSetting> {
    return await this.prisma.setting.findFirst(kwargs)
  }

  async getMany(kwargs?: Prisma.SettingFindManyArgs): Promise<TSetting[]> {
    return await this.prisma.setting.findMany(kwargs)
  }

  async getList(
    kwargs: Prisma.SettingFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.setting.list(kwargs, options)
  }

  async getPage(
    kwargs: Prisma.SettingFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.setting.paginate(kwargs, options)
  }

  async findOrFail(id: number): Promise<TSetting> {
    return await this.prisma.setting
      .findUniqueOrThrow({ where: { id: id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'error.setting.notFound',
        })
      })
  }

  async create(data: Prisma.SettingUncheckedCreateInput): Promise<TSetting> {
    return await this.prisma.setting.create({ data })
  }

  async deleteMany(where?: Prisma.SettingWhereInput): Promise<boolean> {
    const settings = await this.getMany({
      where,
      select: { id: true, code: true },
    })

    for (const setting of settings) {
      try {
        await Promise.all([
          this.prisma.setting.delete({ where: { id: setting.id } }),
          this.settingUtil.removeCache(setting.code),
        ])
      } catch {}
    }

    return true
  }

  async update(id: number, data: Prisma.SettingUncheckedUpdateInput): Promise<TSetting> {
    const setting = await this.findOrFail(id)

    const [updated] = await Promise.all([
      this.prisma.setting.update({ data, where: { id: setting.id } }),
      this.settingUtil.removeCache(setting.code),
    ])

    return updated
  }

  async clearAllCache(): Promise<boolean> {
    const settings = await this.getMany({
      select: { id: true, code: true },
    })

    settings.forEach(setting => this.settingUtil.removeCache(setting.code))

    return true
  }

  async checkValue(value: string, type: string): Promise<boolean> {
    return SettingUtil.checkDataType(value, type)
  }

  async getMaintenance(): Promise<boolean> {
    const data: Prisma.SettingUncheckedCreateInput = {
      code: 'maintenance',
      name: 'Maintenance Mode',
      description: 'Maintenance Mode',
      type: EnumSettingType.BOOLEAN,
      value: 'false',
      isVisible: false,
    }

    const cached = await this.settingUtil.getCache(data.code)
    if (cached) {
      return this.settingUtil.parseCache<boolean>(cached)
    }

    const maintenance = await this.prisma.setting.upsert({
      where: { code: data.code },
      create: data,
      update: data,
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
