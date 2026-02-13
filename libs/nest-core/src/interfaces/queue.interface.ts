interface IQueuePublishBase<T = unknown> {
  version: number
  priority: number
  exclusive?: boolean
  persistent?: boolean // remove when completed
  attempts?: number // retry
  threshold?: number
  message?: T
}

type IQueuePublishDelayOption = {
  delayMs: number
  startDate?: never
}

type IQueuePublishStartDateOption = {
  startDate: Date
  delayMs?: never
}

export interface IQueueCursor {
  lastId: number
  batchId: number
  [key: string]: unknown
}

export interface IQueueWorkerConfig {
  concurrency: number
  pollIntervalMs: number
  archiveIntervalMs?: number
  recoveryIntervalMs?: number
  heartbeatIntervalMs?: number
}

export type IQueuePublishOptions<T = unknown> =
  | (IQueuePublishBase<T> & IQueuePublishDelayOption)
  | (IQueuePublishBase<T> & IQueuePublishStartDateOption)

export type IQueueRepublishOptions<T = unknown> = Omit<
  IQueuePublishOptions<T>,
  'exclusive' | 'startDate'
>

export interface IQueueProducer {
  publish<T = unknown>(topic: string, options?: IQueuePublishOptions<T>): Promise<void>
  republish<T>(topic: string, options?: IQueueRepublishOptions<T>): Promise<void>
}

export interface IQueueConsumer {
  register(handler: IQueueHandler): void
  start(): Promise<void>
  stop(): Promise<void>
}

export interface IQueueScanner {
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
    context,
    retrieve,
    process,
    getLastId,
    beforeReset,
    shouldRepublish,
  }: {
    topic: string
    version: number
    context?: { message: object; childKey: string | number }
    retrieve: (state: IQueueCursor) => Promise<T[]>
    process: (items: T[]) => Promise<void>
    getLastId: (items: T[]) => number | null
    beforeReset?: (state: IQueueCursor) => Promise<void>
    shouldRepublish?: (items: T[], state: IQueueCursor) => Promise<boolean>
  }): Promise<void>
}

export interface IQueueHandler<T = unknown> {
  topic: string
  version: number
  handle(message: T): Promise<void>
}
