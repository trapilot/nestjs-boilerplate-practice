import { IQueueConsumer, IQueueHandler } from '../interfaces'

export abstract class QueueConsumer implements IQueueConsumer {
  abstract register(handler: IQueueHandler): void
  abstract start(): Promise<void>
  abstract stop(): Promise<void>
}
