import { AsyncLocalStorage } from 'async_hooks'
import { APP_LANGUAGE, APP_TIMEZONE } from '../constants'
import { EnumRouteType, EnumScopeType } from '../enums'
import { IScopeContextData } from '../interfaces'

export class ScopeContext {
  private static readonly storage = new AsyncLocalStorage<IScopeContextData>()

  static create<T>(data: IScopeContextData, next: (...args: any[]) => T): T {
    return this.storage.run(data, next)
  }

  static async createAsync<T>(
    data: IScopeContextData,
    next: (...args: any[]) => Promise<T>
  ): Promise<T> {
    return this.storage.run(data, next)
  }

  static current(): IScopeContextData | undefined {
    return this.storage.getStore()
  }

  static currentOrThrow(): IScopeContextData {
    const ctx = this.storage.getStore()
    if (!ctx) throw new Error(`Context does not initialize`)
    return ctx
  }

  static get<T extends keyof IScopeContextData>(
    key: T,
    def?: IScopeContextData[T]
  ): IScopeContextData[T] | undefined {
    const ctx = this.current()
    return ctx?.[key] ?? def
  }

  static getReqData(): IScopeContextData['http'] | undefined {
    const ctx = this.current()
    return ctx?.http
  }

  static getReqZone(defValue: string = APP_TIMEZONE): string {
    try {
      const { timezone } = this.getReqData()
      return timezone
    } catch {}
    return defValue
  }

  static getReqLang(defValue: string = APP_LANGUAGE): string {
    try {
      const { language } = this.getReqData()
      return language
    } catch {}
    return defValue
  }

  static isReqRoute(routeType: EnumRouteType): boolean {
    try {
      const { route } = this.getReqData()
      return route === routeType
    } catch {}
    return false
  }

  static isReq(): boolean {
    const ctx = this.current()
    return ctx && ctx.scopeType == EnumScopeType.HTTP
  }
}
