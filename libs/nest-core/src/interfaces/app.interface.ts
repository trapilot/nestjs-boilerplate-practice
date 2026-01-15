import { DynamicModule, ForwardReference, Type } from '@nestjs/common'
import { Controller, Provider } from '@nestjs/common/interfaces'
import { EnumScopeType } from '../enums'

export type EnumValue = string | number
export type EnumLike<T = EnumValue> = Record<string, T>
export type IModuleImport = Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference
export type IModuleExport = DynamicModule | Type<any> | string | symbol | ForwardReference
export type IModuleController = Type<Controller>
export type IModuleProvider = Provider
export type IModuleRouterOptions = { http?: boolean; cli?: boolean }
export type IModuleSchedulerOptions = { task?: boolean; queue?: boolean }

export interface IScopeContextData {
  readonly scopeType: EnumScopeType
  readonly http?: {
    readonly route: string
    readonly version: string
    readonly language: string
    readonly timezone: string
    readonly tenantId: string
  }
  readonly logger?: {
    readonly context: string
  }
}
