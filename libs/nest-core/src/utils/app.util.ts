import { ValidationError } from '@nestjs/common'
import { ClassConstructor, plainToInstance } from 'class-transformer'
import { validate, ValidatorOptions } from 'class-validator'
import ms from 'ms'
import { hostname } from 'os'
import { APP_ENV, APP_URL } from '../constants'
import { ScopeContext } from '../contexts'
import { EnumAppEnvironment, EnumRouteType } from '../enums'
import { IAppRule } from '../interfaces'
import { FileUtil } from './file.util'

export class AppUtil {
  static isEnv(env: EnumAppEnvironment): boolean {
    return env === APP_ENV
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

  static sleep(value: ms.StringValue): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms(value)))
  }

  static ms(value: ms.StringValue): number {
    return ms(value)
  }

  static seconds(value: ms.StringValue): number {
    return Math.floor(ms(value) / 1000)
  }

  static captureException(exception: any): void {
    console.error(exception)
  }

  static catchMessage(err: unknown): string {
    console.error({ catchMessage: err })
    return err instanceof Error ? err.message : 'Unknown error'
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

  static async validateDto(
    dto: ClassConstructor<any>,
    object: object,
    options?: ValidatorOptions,
  ): Promise<ValidationError[]> {
    const classDto = plainToInstance(dto, object)
    return await validate(classDto, options)
  }

  static initializeRuler<T>(rules: IAppRule<T>[] = []) {
    return new AppRuler<T>(rules)
  }
}

class AppRuler<T> {
  private rules: IAppRule<T>[] = []

  constructor(rules: IAppRule<T>[] = []) {
    this.rules = rules
  }

  addRule(rule: IAppRule<T>): void {
    this.rules.push(rule)
  }

  async validate(data: T): Promise<void> {
    for (const rule of this.rules) {
      await rule.validate(data)
    }
  }
}
