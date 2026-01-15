import { Writable } from 'stream'

export class LoggerRemoteDriver extends Writable {
  private readonly apiUrl: string

  constructor(apiUrl: string) {
    super({ objectMode: true })

    this.apiUrl = apiUrl
  }

  private async sendEntry(data: string, encoding: string): Promise<void> {
    await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entry: data,
        encoding,
      }),
    })
  }

  async _write(logStr: string, encoding: string, callback: (error?: Error | null) => void) {
    try {
      await this.sendEntry(logStr, encoding)

      callback() // Indicate success
    } catch (error) {
      console.error('Failed to send log:', error.message)
      callback() // Indicate success
      // callback(error) // Pass error to the Writable stream
    }
  }
}
