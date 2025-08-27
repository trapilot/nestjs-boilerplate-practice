export class NestRateLimiter {
  private lastRun: number
  private counter: number
  private ttl: number
  private limit: number

  constructor(ttl: number, limit: number) {
    this.ttl = ttl
    this.limit = limit
    this.counter = 0
    this.lastRun = Date.now()
  }

  async throttling(retries: number = 0) {
    this.counter += retries

    if (this.counter >= this.limit) {
      const waiting = this.ttl + 100 - (Date.now() - this.lastRun)
      if (waiting > 0) {
        await new Promise((r) => setTimeout(r, waiting))
      }
      this.counter = retries
      this.lastRun = Date.now()
    }
    this.counter++
  }
}
