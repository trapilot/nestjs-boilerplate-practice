import { ValidationError } from '@nestjs/common'
import { ClassConstructor, plainToInstance } from 'class-transformer'
import { validate, ValidatorOptions } from 'class-validator'
import { hostname } from 'os'
import { APP_ENV, APP_URL } from '../constants'
import { EnumAppEnvironment, EnumRouteType } from '../enums'
import { ScopeContext } from '../helpers'
import { FileUtil } from './file.util'

export class AppUtil {
  static isEnv(env: EnumAppEnvironment): boolean {
    return env === (process.env.APP_ENV || APP_ENV)
  }

  static isLocal(): boolean {
    return this.isEnv(EnumAppEnvironment.DEVELOPMENT)
  }

  static isDebug(): boolean {
    return !this.isLive()
  }

  static isLive(): boolean {
    return this.isEnv(EnumAppEnvironment.PRODUCTION)
  }

  static captureException(exception: any): void {
    console.error(exception)
  }

  static getHostname(): string {
    return hostname()
  }

  static getBaseUrl(): string {
    if (AppUtil.isLocal() && ScopeContext.isReqRoute(EnumRouteType.APP)) {
      return `http://10.0.2.2:3000`
    }
    return process.env.APP_URL || APP_URL
  }

  static buildUrl(path: string, host?: string): string {
    if (!path) return path

    host = host || this.getBaseUrl()
    path = FileUtil.normalize(path)

    return `${host}/${path}`
  }

  static async valiateDto(
    dto: ClassConstructor<any>,
    object: object,
    options?: ValidatorOptions,
  ): Promise<ValidationError[]> {
    const classDto = plainToInstance(dto, object)
    return await validate(classDto, options)
  }
}
