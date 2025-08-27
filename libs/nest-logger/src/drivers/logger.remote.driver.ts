import { Writable } from 'stream'
import { ILoggerEntry } from '../interfaces'
import { LoggerHelper } from '../utils'
import { ENUM_LOGGER_TYPE } from '../enums'

export class LoggerRemoteDriver extends Writable {
  private readonly remoteUrl: string

  constructor(remoteUrl: string) {
    super({ objectMode: true })

    this.remoteUrl = remoteUrl
  }

  private async sendEntry(entry: ILoggerEntry): Promise<void> {
    await fetch(`${this.remoteUrl}/api/audit/send-entry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry),
    })
  }

  async _write(logStr: string, encoding: string, callback: (error?: Error | null) => void) {
    try {
      const entry = LoggerHelper.createEntry(logStr, encoding)

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
