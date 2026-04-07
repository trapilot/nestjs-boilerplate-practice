import { IWorkerCursor, IWorkerScanner } from '../interfaces'

export abstract class WorkerScanner implements IWorkerScanner {
  abstract scan<IWorkerCursor>(name: string, version: number): Promise<IWorkerCursor>
  abstract scans<IWorkerCursor>(name: string): Promise<IWorkerCursor[]>
  abstract reset(name: string, version: number): Promise<void>
  abstract commit(
    name: string,
    options: { version: number; lastId: number | null; batchId: number | null },
  ): Promise<number | null>
  abstract runWithCursor<T>({
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
