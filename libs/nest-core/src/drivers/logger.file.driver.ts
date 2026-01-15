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

/**
 * A custom writable stream for logging to files with rotation based on size.
 * This version includes a simple mutex-like mechanism to handle concurrent writes.
 */
export class LoggerFileDriver extends Writable {
  private shuttingDown: boolean = false
  private readonly directory: string = 'logs'
  private readonly fileStreams: Map<string, WriteStream>
  private readonly filePaths: Map<string, string>
  private readonly fileSizes: Map<string, number> = new Map()

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
  @Cron(CronExpression.EVERY_4_HOURS)
  _cleanUpFileLogs(): void {
    try {
      this.cleanUpFileLogs()
    } catch (err: unknown) {
      console.log({ err })
    }
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
        .filter(f => f.startsWith(fileDate) && f.endsWith('.log'))
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
    } catch (err: unknown) {
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
    this.fileSizes.set(type, 0)
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
      return this.addFileStream(type, filePath)
    }

    // Check if the file size limit has been reached, forcing a new file.
    const { maxSize } = this.getConfig(type)
    const currentSize = this.fileSizes.get(type) || 0

    if (currentSize >= maxSize) {
      fileStream.end()

      this.fileStreams.delete(type)
      this.filePaths.delete(type)
      this.fileSizes.delete(type)

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
   * Deep search and delete old log files recursively.
   */
  cleanUpFileLogs(): void {
    if (!existsSync(this.directory)) return

    const activeFilePaths = new Set(this.filePaths.values())
    const limitDate = new Date()
    limitDate.setHours(0, 0, 0, 0)

    /**
     * Helper function to scan directories recursively
     * @param currentPath Path to scan
     * @param logType The type used for config lookup (e.g., "system.auth")
     */
    const recursiveScan = (currentPath: string, logType: string) => {
      const entries = readdirSync(currentPath)
      const { maxDays } = this.getConfig(logType)

      entries.forEach(entry => {
        const fullPath = FileUtil.join([currentPath, entry])
        const stats = statSync(fullPath)

        if (stats.isDirectory()) {
          recursiveScan(fullPath, logType)
        } else if (stats.isFile()) {
          if (activeFilePaths.has(fullPath)) {
            return
          }

          try {
            const fileDate = new Date(stats.mtime)
            fileDate.setHours(0, 0, 0, 0)

            // Calculate file age in days
            const fileAgeInDays = Math.floor(
              (limitDate.getTime() - fileDate.getTime()) / (1000 * 3600 * 24)
            )

            // Delete if expired
            if (fileAgeInDays >= maxDays) {
              console.log(`[Cleanup] Deleting old log file: ${fullPath}`)
              unlinkSync(fullPath)
            }
          } catch (err: unknown) {
            console.error(`Error processing file ${fullPath}:`, err)
          }
        }
      })
    }

    // Get a list of the original log types
    const rootLogTypes = readdirSync(this.directory)
    rootLogTypes.forEach(type => {
      const logPath = FileUtil.join([this.directory, type])
      if (existsSync(logPath) && statSync(logPath).isDirectory()) {
        recursiveScan(logPath, type)
      }
    })
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
    let logByteLength: number

    try {
      logByteLength = Buffer.byteLength(logStr, 'utf8')
      logType = JSON.parse(logStr).context
    } catch (err: unknown) {
      return callback(err as Error)
    }

    // Wrap the write operation in a function to add to the queue
    const writeOperation = () => {
      try {
        const fileStream = this.getOrCreateFileStream(logType)
        const writeSuccess = fileStream.write(logStr)

        const updateSize = () => {
          const oldSize = this.fileSizes.get(logType) || 0
          this.fileSizes.set(logType, oldSize + logByteLength)
          this.writingStatus.set(logType, false)
          callback()
          this._processQueue(logType)
        }

        // Handle backpressure
        if (writeSuccess) {
          updateSize()
        } else {
          fileStream.once('drain', updateSize)
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
