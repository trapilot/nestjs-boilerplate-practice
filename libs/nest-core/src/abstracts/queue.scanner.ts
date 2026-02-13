import { IQueueCursor, IQueueScanner } from '../interfaces'

export abstract class QueueScanner implements IQueueScanner {
  abstract scan<IQueueCursor>(name: string, version: number): Promise<IQueueCursor>
  abstract scans<IQueueCursor>(name: string): Promise<IQueueCursor[]>
  abstract reset(name: string, version: number): Promise<void>
  abstract commit(
    name: string,
    options: { version: number; lastId: number | null; batchId: number | null },
  ): Promise<number | null>
  abstract runWithCursor<T>({
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
