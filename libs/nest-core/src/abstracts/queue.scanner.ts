import { IQueueScanner } from '../interfaces'

export abstract class QueueScanner implements IQueueScanner {
  abstract scan<T>(name: string, version: number): Promise<T>

  abstract scans<T>(name: string): Promise<T[]>

  abstract reset(name: string, version: number): Promise<void>

  abstract commit(
    name: string,
    options: { version: number; lastId: number | null; batchId: number | null },
  ): Promise<number | null>
}
