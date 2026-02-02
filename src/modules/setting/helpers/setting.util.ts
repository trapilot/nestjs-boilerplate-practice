import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { CacheService, EnumAppEnvironment, StrUtil } from 'lib/nest-core'
import { EnumSettingType } from '../enums/setting.enum'

interface IValueData {
  value: string
  type: string | EnumSettingType
}

@Injectable()
export class SettingUtil {
  private readonly appEnv: EnumAppEnvironment
  constructor(
    private readonly cache: CacheService,
    private readonly config: ConfigService,
  ) {
    this.appEnv = this.config.get<EnumAppEnvironment>('app.env')
  }

  private createCacheKey(code: string): string {
    return `${this.appEnv}:setting:${code}`
  }

  private createCacheValue(data: IValueData): string {
    return [data.type, data.value].join(':')
  }

  private parseCachedData(cached: string): IValueData {
    const data = cached.split(':')
    return {
      type: data[0],
      value: data[1],
    }
  }

  async getCache(code: string): Promise<string> {
    const key = this.createCacheKey(code)
    return await this.cache.get(key)
  }

  async storeCache(code: string, options: { data: IValueData; ttl?: number }): Promise<string> {
    const key = this.createCacheKey(code)
    const value = this.createCacheValue(options.data)

    return await this.cache.set(key, value, options?.ttl)
  }

  async removeCache(code: string): Promise<boolean> {
    const key = this.createCacheKey(code)
    return await this.cache.del(key)
  }

  parseCache<T>(cached: string): T {
    const data: IValueData = this.parseCachedData(cached)
    return SettingUtil.parseCache<T>(data.value, data.type)
  }

  static parseCache<T = unknown>(value: string, type: string): T {
    switch (type) {
      case EnumSettingType.ARRAY:
      case EnumSettingType.JSON:
        return JSON.parse(value) as T
      case EnumSettingType.NUMBER:
        return Number(value) as T
      case EnumSettingType.BOOLEAN:
        return StrUtil.isTrue(value) as T
      default:
        return value as T
    }
  }

  static checkDataType(value: string, type: string): boolean {
    switch (type) {
      case EnumSettingType.BOOLEAN:
        return ['true', 'false', 'T', 'F', '1', '0'].includes(value)
      case EnumSettingType.NUMBER:
        return StrUtil.isNumber(value)
      case EnumSettingType.ARRAY:
        return StrUtil.isJson(value)
      case EnumSettingType.JSON:
        return StrUtil.isArray(value)
      case EnumSettingType.STRING:
        return true
      default:
        return false
    }
  }
}
