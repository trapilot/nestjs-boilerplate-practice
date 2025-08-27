import { BadRequestException, HttpStatus } from '@nestjs/common'
import { NestHelper } from './nest.helper'

interface ISlipOptions {
  prefix?: string
  length: number
  separator?: string
  daily?: boolean
  monthly?: boolean
  yearly?: boolean
}

export class NestSlip {
  private locked: boolean = false
  private counter: number = 0
  private retries: number = 0

  private minLength: number
  private lastDate: number

  private readonly daily: boolean
  private readonly monthly: boolean
  private readonly yearly: boolean
  private readonly prefix: string
  private readonly separator: string

  constructor(options: ISlipOptions) {
    this.daily = options?.daily
    this.monthly = options?.monthly
    this.yearly = options?.yearly
    this.prefix = options?.prefix ?? ''
    this.separator = options?.separator ?? ''
    this.minLength = options?.length ?? 1
    this.lastDate = this.getDate()
  }

  private getDate(): number {
    if (this.daily) {
      return new Date().getDate()
    }
    if (this.monthly) {
      return new Date().getMonth()
    }
    if (this.yearly) {
      return new Date().getFullYear()
    }
    return null
  }

  private getRotate(): string {
    if (this.daily) {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      return `${year}${month}${day}`
    }
    if (this.monthly) {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      return `${year}${month}`
    }
    if (this.yearly) {
      const today = new Date()
      const year = today.getFullYear()
      return `${year}`
    }
    return ''
  }

  private async lock(): Promise<void> {
    this.locked = true
  }

  private async release(): Promise<void> {
    this.locked = false
    this.retries = 0
  }

  private async increase(): Promise<void> {
    if (this.locked) {
      while (this.locked && this.retries < 5) {
        this.retries++

        await NestHelper.sleep('1s')
      }
    }

    if (this.locked) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'request.error.requestIsLocked',
      })
    }

    try {
      await this.lock()
      const currDate = this.getDate()
      if (currDate !== this.lastDate) {
        this.lastDate = currDate
        this.counter = 0
      }

      this.counter++
      await this.release()
    } catch (err: any) {
      await this.release()
      throw err
    }
  }

  async next(): Promise<string> {
    await this.increase()

    const currLength = `${this.counter}`.length
    if (this.minLength < currLength) {
      this.minLength = currLength
    }

    const prefix = [this.prefix, this.getRotate()].filter((s) => s).join(this.separator)
    const counter = `${this.counter}`.padStart(this.minLength, '0')
    return [prefix, counter].join(this.separator)
  }

  async apply(slip: string): Promise<void> {
    if (slip) {
      const prefix = [this.prefix, this.getRotate()].filter((s) => s).join(this.separator)
      const counter = Number(slip.replace(prefix, ''))
      await this.update(isNaN(counter) ? 0 : counter)
    }
  }

  async reset(): Promise<void> {
    this.update(0)
  }

  async update(counter: number = 0): Promise<void> {
    this.lock()
    this.counter = counter
    this.lastDate = this.getDate()
    this.release()
  }
}
