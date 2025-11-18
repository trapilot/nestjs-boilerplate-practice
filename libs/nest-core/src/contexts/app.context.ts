import { AsyncLocalStorage } from 'async_hooks'
import { APP_LANGUAGE, APP_TIMEZONE, APP_VERSION_NUMBER } from '../constants'
import { ENUM_APP_API_TYPE } from '../enums'
import { IRequestContext } from '../interfaces'

export class AppContext {
  private static readonly storage = new AsyncLocalStorage<AppContext>()

  readonly apiType: ENUM_APP_API_TYPE | string | null
  readonly apiVersion: string
  readonly timezone: string
  readonly language: string

  constructor(ctx: IRequestContext) {
    this.apiType = ctx.apiType
    this.apiVersion = ctx.apiVersion
    this.timezone = ctx.timezone
    this.language = ctx.language
  }

  static create(ctx: AppContext, next: (...args: any[]) => void): void {
    this.storage.run(ctx, next)
  }

  static current(): AppContext | undefined {
    return this.storage.getStore()
  }

  static timezone(): string {
    return this.current()?.timezone ?? APP_TIMEZONE
  }

  static language(): string {
    return this.current()?.language ?? APP_LANGUAGE
  }

  static apiType(): ENUM_APP_API_TYPE | string | null {
    return this.current()?.apiType ?? null
  }

  static apiVersion(): string {
    return this.current()?.apiVersion ?? APP_VERSION_NUMBER
  }

  static isAdmin(): boolean {
    return this.apiType() === ENUM_APP_API_TYPE.CMS
  }
}
