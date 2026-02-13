export interface IDomainEvent<T = unknown> {
  topic: string
  version: number
  payload: T
}

export interface IEventEnvelope<T = unknown> extends IDomainEvent<T> {
  id: string
  occurredAt: Date
  metadata?: {
    correlationId?: string
    causationId?: string
    userId?: string
  }
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

export interface IEventBus {
  publish<T>(event: IDomainEvent<T>): Promise<void>
  subscribe<T>(topic: string, handler: (event: IDomainEvent<T>) => Promise<void> | void): void
}

export interface IEventDispatcher {
  dispatch<T>(eventName: string, event: IDomainEvent<T>): Promise<void>
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
