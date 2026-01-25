interface IQueuePublishBase<T = unknown> {
  version: number
  priority: number
  exclusive: boolean
  autoDelete: boolean // remove on completed
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

export type IQueuePublishOptions<T = unknown> =
  | (IQueuePublishBase<T> & IQueuePublishDelayOption)
  | (IQueuePublishBase<T> & IQueuePublishStartDateOption)

export type IQueueRepublishOptions<T = unknown> = Omit<
  IQueuePublishOptions<T>,
  'exclusive' | 'startDate' | 'autoDelete'
> & { autoDelete?: boolean }

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
}

export interface IQueueHandler<T = unknown> {
  topic: string
  version: number
  handle(message: T): Promise<void>
}
