export type PaginationMeta = {
  page: number
  perPage: number
  totalPage: number
  totalRecord: number
}

export type BaseMetadata = {
  path: string
  language: string
  timezone: string
  version: string
  timestamp: number
}

export type ListMetadata = BaseMetadata & {
  availableSearch?: string[]
  availableOrderBy?: string[]
}

export type ResponseMetadata = ListMetadata & {
  pagination?: PaginationMeta
}

let lastMetadata: ResponseMetadata | null = null

export function setLastMetadata(meta: ResponseMetadata | null) {
  lastMetadata = meta
}

export function getLastMetadata(): ResponseMetadata | null {
  return lastMetadata
}
