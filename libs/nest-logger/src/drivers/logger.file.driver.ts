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
import { ArrUtil, FileUtil, StrUtil } from 'lib/nest-core'
import { Writable } from 'stream'
import { ILoggerFileConfig, ILoggerFileOptions } from '../interfaces'
import { LoggerUtil } from '../utils'

/**
 * A custom writable stream for logging to files with rotation based on size.
 * This version includes a simple mutex-like mechanism to handle concurrent writes.
 */
export class LoggerFileDriver extends Writable {
  private shuttingDown: boolean = false
  private readonly directory: string = 'logs'
  private readonly fileStreams: Map<string, WriteStream>
  private readonly filePaths: Map<string, string>

  // Simple mutex mechanism to serialize write operations
  private readonly writingStatus: Map<string, boolean> = new Map()
  private readonly queues: Map<string, (() => void)[]> = new Map()

  constructor(private readonly config: ILoggerFileConfig) {
    super({ objectMode: true })

    this.fileStreams = new Map()
    this.filePaths = new Map()

    this.registerShutdownHooks()
  }

  /**
   * Cron job to clean up old log files every day at midnight.
   * This job will delete any log files older than the specified limit,
   * regardless of whether they have been rotated.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  private _CronCleanUpFileLogs(): void {
    if (!existsSync(this.directory)) {
      return
    }

    // Get all log types (subdirectories)
    const logTypes = readdirSync(this.directory)
    const logDate = new Date()
    logTypes.forEach((type) => {
      const logPath = FileUtil.join([this.directory, type])

      if (existsSync(logPath) && statSync(logPath).isDirectory()) {
        const files = readdirSync(logPath)
        const { maxDays } = this.getConfig(type)

        files.forEach((file) => {
          const filePath = FileUtil.join([logPath, file])

          try {
            const fileStat = statSync(filePath)
            // Calculate file age in days
            const fileAgeInDays = Math.floor(
              (logDate.getTime() - fileStat.mtime.getTime()) / (1000 * 3600 * 24),
            )

            // Delete files older than the specified limit
            if (fileAgeInDays >= maxDays) {
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
   * Registers Node.js process shutdown hooks.
   *
   * This method listens for termination signals (SIGINT, SIGTERM, beforeExit)
   * and ensures that all active file streams are gracefully closed
   * before the application exits.
   *
   * It prevents multiple executions during shutdown by guarding
   * against repeated signal emissions.
   */
  private registerShutdownHooks() {
    const shutdown = () => {
      if (this.shuttingDown) return

      this.shuttingDown = true
      this.closeAllStreams()
    }

    process.on('SIGINT', shutdown) // Ctrl + C
    process.on('SIGTERM', shutdown) // Docker, PM2, k8s
    process.on('beforeExit', shutdown)
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
    const dirPath = FileUtil.join([
      this.directory,
      ...StrUtil.split(type, { delimiter: '.', maxSplit: 2 }),
    ])

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
        .sort((a, b) => {
          const numOne = Number(a.match(/\.(\d+)\.log$/)[1])
          const numTwo = Number(b.match(/\.(\d+)\.log$/)[1])
          return numOne - numTwo
        })

      if (files.length > 0) {
        lastFileForDay = FileUtil.join([dirPath, files.at(-1)])
        const lastFileMatch = files.at(-1).match(/\.(\d+)\.log$/)
        if (lastFileMatch) {
          nextIndex = parseInt(lastFileMatch[1], 10) + 1
        }
      }

      // Check if the last file can be reused
      if (lastFileForDay) {
        const { maxSize } = this.getConfig(type)
        const stats = statSync(lastFileForDay)
        if (stats.size < maxSize) {
          filePath = lastFileForDay
        }
      }
    } catch (err: any) {
      console.error('Error checking existing log files:', err)
    }

    // If no existing file to append to was found, create a new file path
    if (!filePath) {
      const fileName = ArrUtil.join([fileDate, nextIndex, 'log'], { delimiter: '.' })
      filePath = FileUtil.join([dirPath, fileName])
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
   * Gets config by type of log.
   * @returns The configuration.
   */
  private getConfig(type: string): ILoggerFileOptions {
    return this.config[type] ?? this.config.default
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
      const { maxSize } = this.getConfig(type)
      if (stats.size >= maxSize) {
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
  async _write(logStr: string, _encoding: string, callback: (error?: Error | null) => void) {
    let logType: string
    try {
      const logChunk = JSON.parse(logStr)
      logType = logChunk.context || LoggerUtil.getContextDefault()
    } catch (err: any) {
      return callback(err)
    }

    // Wrap the write operation in a function to add to the queue
    const writeOperation = () => {
      try {
        const fileStream = this.getOrCreateFileStream(logType)
        const writeSuccess = fileStream.write(logStr)

        // Handle backpressure
        if (writeSuccess) {
          this.writingStatus.set(logType, false)
          callback()
          this._processQueue(logType)
        } else {
          fileStream.once('drain', () => {
            this.writingStatus.set(logType, false)
            callback()
            this._processQueue(logType)
          })
        }
      } catch (error) {
        console.error('Failed to send log:', error.message)
        this.writingStatus.set(logType, false)
        callback(error)
        this._processQueue(logType)
      }
    }

    // If a write operation is already in progress, add to the queue
    if (this.writingStatus.get(logType)) {
      if (!this.queues.has(logType)) {
        this.queues.set(logType, [])
      }
      this.queues.get(logType)!.push(writeOperation)
    } else {
      // Otherwise, start the write operation immediately
      this.writingStatus.set(logType, true)
      writeOperation()
    }
  }

  /**
   * Processes the next write operation in the queue.
   */
  private _processQueue(type: string): void {
    const queue = this.queues.get(type)
    if (queue && queue.length > 0) {
      const nextOperation = queue.shift()
      if (nextOperation) {
        this.writingStatus.set(type, true)
        nextOperation()
      }
    }
  }
}
