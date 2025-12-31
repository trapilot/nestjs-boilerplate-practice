export interface IArrayJoinOptions {
  delimiter: string
  allowEmpty?: boolean
}

export interface IArrayFindOptions<T> {
  field?: string
  value: T
}
