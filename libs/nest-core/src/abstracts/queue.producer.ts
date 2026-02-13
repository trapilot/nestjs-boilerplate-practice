import { IQueueProducer, IQueuePublishOptions, IQueueRepublishOptions } from '../interfaces'

export abstract class QueueProducer implements IQueueProducer {
  abstract publish<T = unknown>(topic: string, options?: IQueuePublishOptions<T>): Promise<void>

  abstract republish<T>(topic: string, options?: IQueueRepublishOptions<T>): Promise<void>
}
