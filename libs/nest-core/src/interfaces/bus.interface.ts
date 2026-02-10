export interface IDomainEvent<T = unknown> {
  topic: string
  version: number
  payload: T
}

export interface IEventBus {
  publish<T>(event: IDomainEvent<T>): void
}
