import { IWorkerConsumer, IWorkerHandler } from '../interfaces'

export abstract class WorkerConsumer implements IWorkerConsumer {
  abstract register(handler: IWorkerHandler): void
  abstract start(): Promise<void>
  abstract stop(): Promise<void>
}
