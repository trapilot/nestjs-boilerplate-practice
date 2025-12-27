export type EnumValue = string | number
export type EnumLike<T = EnumValue> = Record<string, T>

export interface IStep<T> {
  invoke(input: T): any
  compensate(input: T): any
}

export interface IExportableMetadata {
  header?: string
  sorting?: number
}

export interface IClientData {
  userId: string
  userToken: string
  userDevice: string
  joinAt: number
  verifyAt: number
}

export interface IClientMessage {
  data: IClientData
  version?: string
}

export interface IClientIdentify {
  userId: string
  userToken: string
}

export interface IClientQuery {
  userId: string
  userDevice: string
  [key: string]: any
}
