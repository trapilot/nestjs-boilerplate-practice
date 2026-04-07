interface IWorkerPublishBase<T> {
  version: number
  priority: number
  exclusive?: boolean
  persistent?: boolean // remove when completed
  attempts?: number // retry
  threshold?: number
  message?: T
}

type IWorkerPublishDelayOption = {
  delayMs: number
  startDate?: never
}

type IWorkerPublishStartDateOption = {
  startDate: Date
  delayMs?: never
}

export interface IWorkerCursor {
  lastId: number
  batchId: number
  [key: string]: unknown
}

export interface IWorkerConfig {
  concurrency: number
  pollIntervalMs: number
  archiveIntervalMs?: number
  recoveryIntervalMs?: number
  heartbeatIntervalMs?: number
}

export type IWorkerPublishOptions<T = unknown> =
  | (IWorkerPublishBase<T> & IWorkerPublishDelayOption)
  | (IWorkerPublishBase<T> & IWorkerPublishStartDateOption)

export type IWorkerRepublishOptions<T> = Omit<IWorkerPublishOptions<T>, 'exclusive' | 'startDate'>

export interface IWorkerProducer {
  publish<T>(topic: string, options?: IWorkerPublishOptions<T>): Promise<void>
  republish<T>(topic: string, options?: IWorkerRepublishOptions<T>): Promise<void>
}

export interface IWorkerConsumer {
  register<T>(handler: IWorkerHandler<T>): void
  start(): Promise<void>
  stop(): Promise<void>
}

export interface IWorkerScanner {
  scan<T>(name: string, version: number): Promise<T>
  scans<T>(name: string): Promise<T[]>
  reset(name: string, version: number): Promise<void>
  commit(
    name: string,
    options: {
      version: number
      batchId: number | null
      lastId: number | null
    },
  ): Promise<number | null>
  runWithCursor<T>({
    topic,
    version,
    chunking,
    context,
    retrieve,
    process,
    beforeReset,
    shouldRepublish,
  }: {
    topic: string
    version: number
    chunking?: number
    context?: { message: object; childKey: string | number }
    retrieve: (state: IWorkerCursor) => Promise<T[]>
    process: (items: T[]) => Promise<number | null>
    beforeReset?: (state: IWorkerCursor) => Promise<void>
    shouldRepublish?: (items: T[], state: IWorkerCursor) => Promise<boolean>
  }): Promise<void>
}

export interface IWorkerHandler<T = unknown> {
  topic: string
  version: number
  handle(version: number, message: T): Promise<void>
}

export interface IWorkerEventEnvelope<T> {
  topic: string
  version: number
  payload: T
  metadata?: {
    correlationId?: string
    causationId?: string
    userId?: string
    traceId?: string
    tenantId?: string
  }
}
