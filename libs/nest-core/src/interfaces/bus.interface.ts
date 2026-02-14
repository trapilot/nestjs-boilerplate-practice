export interface IEventMetadata {
  correlationId?: string
  causationId?: string
  userId?: string
  traceId?: string
  tenantId?: string
}

export interface IDomainEvent<T = unknown> {
  topic: string
  version: number
  payload: T
  metadata?: IEventMetadata
}

export interface IEventEnvelope<T = unknown> extends IDomainEvent<T> {
  id: string
  occurredAt: Date
}

export interface ICommand<T = any> {
  topic: string
  version: number
  payload: T
}

export interface ISchedulerOptions {
  name?: string
  timeZone?: string
  disabled?: boolean
  timeoutMs?: number
  preventOverlap?: boolean
  useRedisLock?: boolean
  lockTtlMs?: number
}

export interface ICommandBus {
  execute<T, R = any>(command: ICommand<T>): Promise<R>
  register<T, R = any>(topic: string, handler: (command: ICommand<T>) => Promise<R> | R): void
}

export interface ICommandHandler {
  register(bus: ICommandBus): void
}

export interface IEventBus {
  publish<T>(event: IDomainEvent<T>): Promise<void>
  subscribe<T>(topic: string, handler: (event: IDomainEvent<T>) => Promise<void> | void): void
}

export interface IEventListener {
  register(bus: IEventBus): void
}

export interface ISchedulerBus {
  cron(expression: string, handler: () => Promise<void>, options?: ISchedulerOptions): string
  enable(name: string): void
  disable(name: string): void
  shutdown(): Promise<void>
}

export interface IScheduler {
  register(bus: ISchedulerBus): void
}
