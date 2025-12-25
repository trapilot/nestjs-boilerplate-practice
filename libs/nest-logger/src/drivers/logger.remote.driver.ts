import { Writable } from 'stream'
import { ENUM_LOGGER_TYPE } from '../enums'
import { ILoggerEntry } from '../interfaces'
import { LoggerUtil } from '../utils'

export class LoggerRemoteDriver extends Writable {
  private readonly apiUrl: string

  constructor(apiUrl: string) {
    super({ objectMode: true })

    this.apiUrl = apiUrl
  }

  private async sendEntry(entry: ILoggerEntry): Promise<void> {
    await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry),
    })
  }

  async _write(logStr: string, encoding: string, callback: (error?: Error | null) => void) {
    try {
      const entry = LoggerUtil.createEntry(logStr, encoding)

      // currently ignore log sql,  it loop
      if (entry.data.context !== ENUM_LOGGER_TYPE.MYSQL) {
        await this.sendEntry(entry)
      }

      callback() // Indicate success
    } catch (error) {
      console.error('Failed to send log:', error.message)
      callback() // Indicate success
      // callback(error) // Pass error to the Writable stream
    }
  }
}
