import { Cron, CronExpression } from '@nestjs/schedule'
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  unlinkSync,
  WriteStream,
} from 'fs'
import { join } from 'path'
import { Writable } from 'stream'
import { ENUM_LOGGER_TYPE } from '../enums'

/**
 * A custom writable stream for logging to files with rotation based on size.
 * This version includes a simple mutex-like mechanism to handle concurrent writes.
 */
export class LoggerFileDriver extends Writable {
  private readonly fileStreams: Map<string, WriteStream>
  private readonly filePaths: Map<string, string>

  private readonly fileMaxDays: number = 90
  private readonly fileMaxSize: number = 500 * 1024 * 1024

  // Simple mutex mechanism to serialize write operations
  private isWriting = false
  private readonly writeQueue: (() => void)[] = []

  constructor() {
    super({ objectMode: true })

    this.fileStreams = new Map()
    this.filePaths = new Map()
  }

  /**
   * Cron job to clean up old log files every day at midnight.
   * This job will delete any log files older than the specified limit,
   * regardless of whether they have been rotated.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  private _CronCleanUpFileLogs(): void {
    console.log('Running log cleanup task...')
    const logsDirectory = 'logs'

    if (!existsSync(logsDirectory)) {
      return
    }

    // Get all log types (subdirectories)
    const logTypes = readdirSync(logsDirectory)
    const logDate = new Date()
    logTypes.forEach((type) => {
      const logPath = join(logsDirectory, type)

      if (existsSync(logPath) && statSync(logPath).isDirectory()) {
        const files = readdirSync(logPath)

        files.forEach((file) => {
          const filePath = join(logPath, file)

          try {
            const fileStat = statSync(filePath)
            // Calculate file age in days
            const fileAgeInDays = Math.floor(
              (logDate.getTime() - fileStat.mtime.getTime()) / (1000 * 3600 * 24),
            )

            // Delete files older than the specified limit
            if (fileAgeInDays >= this.fileMaxDays) {
              console.log(`Deleting old log file: ${filePath}`)
              unlinkSync(filePath)
            }
          } catch (e) {
            console.error(`Error statting file ${filePath}:`, e)
          }
        })
      }
    })
  }

  /**
   * Finds the next available file path based on the date and a sequential index.
   * It checks for an existing file to append to before creating a new one.
   * This method now uses a single loop for efficiency.
   * @param type The type of log (e.g., 'error', 'system').
   * @returns An object containing the new file path and the current date string.
   */
  private createFilePath(type: string): { filePath: string; fileDate: string } {
    const fileDate = this.getRotateDate()
    const dirPath = join('logs', type)

    // Create directory if it does not exist
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true })
    }

    let filePath = ''
    let nextIndex = 1
    let lastFileForDay = ''

    try {
      const files = readdirSync(dirPath)
        .filter((f) => f.startsWith(fileDate) && f.endsWith('.log'))
        .sort()

      if (files.length > 0) {
        lastFileForDay = join(dirPath, files[files.length - 1])
        const lastFileMatch = files[files.length - 1].match(/\.(\d{4})\.log$/)
        if (lastFileMatch) {
          nextIndex = parseInt(lastFileMatch[1], 10) + 1
        }
      }

      // Check if the last file can be reused
      if (lastFileForDay) {
        const stats = statSync(lastFileForDay)
        if (stats.size < this.fileMaxSize) {
          filePath = lastFileForDay
        }
      }
    } catch (e) {
      console.error('Error checking existing log files:', e)
    }

    // If no existing file to append to was found, create a new file path
    if (!filePath) {
      const fileIndex = String(nextIndex).padStart(4, '0')
      filePath = join(dirPath, `${fileDate}.${fileIndex}.log`)
    }

    return { filePath, fileDate }
  }

  /**
   * Creates a new file stream and updates internal maps.
   * @param type The type of log.
   * @param filePath The path to the file.
   * @returns The newly created WriteStream.
   */
  private addFileStream(type: string, filePath: string): WriteStream {
    const fileStream = createWriteStream(filePath, { flags: 'a' })

    this.fileStreams.set(type, fileStream)
    this.filePaths.set(type, filePath)
    return fileStream
  }

  /**
   * Gets the current date in YYYY-MM-DD format.
   * @returns The formatted date string.
   */
  private getRotateDate(): string {
    return new Date().toISOString().split('T')[0]
  }

  /**
   * Retrieves an existing file stream or creates a new one.
   * @param type The type of log.
   * @returns The appropriate WriteStream.
   */
  private getOrCreateFileStream(type: string): WriteStream {
    let fileStream = this.fileStreams.get(type)

    if (!fileStream) {
      const { filePath } = this.createFilePath(type)
      fileStream = this.addFileStream(type, filePath)
    }

    // Check if the file size limit has been reached, forcing a new file.
    try {
      const stats = statSync(this.filePaths.get(type))
      if (stats.size >= this.fileMaxSize) {
        fileStream.end()
        this.fileStreams.delete(type)
        this.filePaths.delete(type)
        const { filePath: newFilePath } = this.createFilePath(type)
        return this.addFileStream(type, newFilePath)
      }
    } catch (_err: any) {
      // If the file does not exist (e.g., was deleted), create a new one.
      // console.error(`File for ${type} was not found, creating a new file...`)
      this.fileStreams.delete(type)
      this.filePaths.delete(type)
      const { filePath: newFilePath } = this.createFilePath(type)
      return this.addFileStream(type, newFilePath)
    }

    return fileStream
  }

  /**
   * Closes all active file streams.
   */
  public closeAllStreams(): void {
    for (const [type, stream] of this.fileStreams) {
      stream.end()
      this.fileStreams.delete(type)
    }
  }

  /**
   * The core method for writing log chunks to the appropriate file.
   * This method uses a simple queue to handle concurrent write requests,
   * ensuring that only one write operation is active at a time.
   * @param logStr The log string to write.
   * @param encoding The string encoding.
   * @param callback The callback to signal completion.
   */
  async _write(logStr: string, encoding: string, callback: (error?: Error | null) => void) {
    // Wrap the write operation in a function to add to the queue
    const writeOperation = () => {
      try {
        const logChunk = JSON.parse(logStr)
        const logType = logChunk.context || ENUM_LOGGER_TYPE.SYSTEM

        const fileStream = this.getOrCreateFileStream(logType)
        const writeSuccess = fileStream.write(logStr)

        // Handle backpressure
        if (writeSuccess) {
          this.isWriting = false
          callback()
          this._processQueue()
        } else {
          fileStream.once('drain', () => {
            this.isWriting = false
            callback()
            this._processQueue()
          })
        }
      } catch (error) {
        console.error('Failed to send log:', error.message)
        this.isWriting = false
        callback(error)
        this._processQueue()
      }
    }

    // If a write operation is already in progress, add to the queue
    if (this.isWriting) {
      this.writeQueue.push(writeOperation)
    } else {
      // Otherwise, start the write operation immediately
      this.isWriting = true
      writeOperation()
    }
  }

  /**
   * Processes the next write operation in the queue.
   */
  private _processQueue(): void {
    if (this.writeQueue.length > 0 && !this.isWriting) {
      const nextOperation = this.writeQueue.shift()
      if (nextOperation) {
        this.isWriting = true
        nextOperation()
      }
    }
  }
}
