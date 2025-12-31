import { ClientWithExtends } from '../interfaces'

export class PrismaClusterManager {
  private cursor = 0

  constructor(
    private readonly writer: ClientWithExtends,
    private readonly readers: ClientWithExtends[],
  ) {}

  async connect() {
    await this.writer.$disconnect()
    for (const reader of this.readers) {
      if (reader !== this.writer) {
        await reader.$disconnect()
      }
    }
  }

  async disconnect() {
    await this.writer.$disconnect()
    for (const reader of this.readers) {
      if (reader !== this.writer) {
        await reader.$disconnect()
      }
    }
  }

  pick(isWriter: boolean = true): ClientWithExtends {
    if (isWriter) {
      return this.writer
    }

    const reader = this.readers[this.cursor]
    this.cursor = (this.cursor + 1) % this.readers.length
    return reader
  }

  pair(): { writer: ClientWithExtends; reader: ClientWithExtends } {
    return {
      writer: this.pick(true),
      reader: this.pick(false),
    }
  }
}
