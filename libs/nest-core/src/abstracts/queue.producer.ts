import { IWorkerProducer, IWorkerPublishOptions, IWorkerRepublishOptions } from '../interfaces'

export abstract class WorkerProducer implements IWorkerProducer {
  abstract publish<T = unknown>(topic: string, options?: IWorkerPublishOptions<T>): Promise<void>

  abstract republish<T>(topic: string, options?: IWorkerRepublishOptions<T>): Promise<void>
}
