export interface IStep<T> {
  invoke(input: T): any
  compensate(input: T): any
}
