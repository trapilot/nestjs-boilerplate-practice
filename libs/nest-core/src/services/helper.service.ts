import { Injectable } from '@nestjs/common'
import { compareSync, genSaltSync, hashSync } from 'bcrypt'
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  createSign,
  createVerify,
} from 'crypto'
import { DateObjectUnits, DateTime, Duration, DurationLikeObject } from 'luxon'
import RandExp from 'randexp'
import { IResult } from 'ua-parser-js'
import { ScopeContext } from '../contexts'
import { EnumCountryCode, EnumDateFormat } from '../enums'
import {
  IDateCompareOptions,
  IDateCreateOptions,
  IDateExtractData,
  IDateRange,
  IEncryptionHashOptions,
  IEncryptionHmacOptions,
  IEncryptionSignOptions,
  IEncryptionVerifyOptions,
  INumberRandomOptions,
  IStringFormatOptions,
  IStringPadZeroOptions,
  IStringRandomOptions,
} from '../interfaces'
import { ArrUtil, DateUtil, StrUtil } from '../utils'

@Injectable()
export class HelperService {
  BASE_CHARS: Record<number, string> = {
    10: '0123456789',
    16: '0123456789ABCDEF',
    36: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    62: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  }

  arrayReverse<T>(array: T[]): T[] {
    return array.reverse()
  }

  arrayUnique<T>(array: T[]): T[] {
    return [...new Set(array)]
  }

  arrayMerge<T>(a: T[], b: T[]): T[] {
    return a.concat(b)
  }

  arrayRandom<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)]
  }

  arrayDifference<T>(a: T[], b: T[]): T[] {
    if (b.length === 0) return a
    if (a.length === 0) return b
    const _a = a.filter(x => !b.includes(x))
    return [..._a, ...b.filter(x => !_a.includes(x) && !a.includes(x))]
  }

  arrayIntersection<T>(a: T[], b: T[]): T[] {
    if (a.length === 0 || b.length === 0) return []
    const _a = a.filter(x => b.includes(x))
    return [..._a, ...b.filter(x => !_a.includes(x) && a.includes(x))]
  }

  arrayChunk<T>(a: T[], size: number): T[][] {
    return a.reduce((c, i, index) => {
      const idx = Math.floor(index / size)
      if (!c[idx]) c[idx] = []
      c[idx].push(i)
      return c
    }, [])
  }

  arrayGroup<T>(a: T[], size: number): T[][] {
    const c = Array.from({ length: size }, () => [])
    let idx = 0
    for (const i of a) {
      c[idx % size].push(i)
      idx++
    }
    return c
  }

  checkNumberString(number: string): boolean {
    const regex = /^-?\d+$/
    return regex.test(number)
  }

  randomBoolean(ratio: number = 50): boolean {
    if (ratio <= 0 || ratio > 100) ratio = 50 // default 50%
    return 0 === Math.floor(Math.random() * Math.floor(100 / ratio))
  }

  randomNumber(options: INumberRandomOptions): number {
    const min = Math.ceil(options.min)
    const max = Math.floor(options.max)
    return Math.floor(Math.random() * (max - min) + min)
  }

  calculatePercent(value: number, total: number): number {
    let tValue = value / total
    if (Number.isNaN(tValue) || !Number.isFinite(tValue)) {
      tValue = 0
    }
    return Number.parseFloat((tValue * 100).toFixed(2))
  }

  calculateAge(dateOfBirth: Date, fromYear?: number): Duration {
    const timeZone = ScopeContext.getReqZone()
    const dateTime = DateTime.now().setZone(timeZone).plus({ day: 1 }).set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    })
    const dateTimeDob = DateTime.fromJSDate(dateOfBirth).setZone(timeZone).set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    })

    if (fromYear) {
      dateTime.set({ year: fromYear })
    }

    return dateTime.diff(dateTimeDob)
  }

  randomBirthDate(minAge: number, maxAge: number): Date {
    const today = DateTime.now()

    // Oldest allowed birthdate
    const maxBirthDate = today.minus({ years: minAge }).toMillis()

    // Youngest allowed birthdate
    const minBirthDate = today.minus({ years: maxAge }).toMillis()

    const randomMillis = Math.random() * (maxBirthDate - minBirthDate) + minBirthDate

    return DateTime.fromMillis(randomMillis).toJSDate()
  }

  mixinString(
    items: string[][],
    options?: {
      delimiter?: string
      prefix?: string
      suffix?: string
      format?: 'uppercase' | 'lowercase' | 'capitalize'
    },
  ): string {
    return ArrUtil.join(
      [
        options?.prefix,
        StrUtil.format(
          ArrUtil.join(
            items.map(arr => this.arrayRandom(arr)),
            { delimiter: options?.delimiter ?? '' },
          ),
          { format: options?.format },
        ),
        options?.suffix,
      ],
      { delimiter: '', allowEmpty: false },
    )
  }

  randomDigits(length: number, options?: { prefix?: string; suffix?: string }): string {
    const min = Number.parseInt(`1`.padEnd(length, '0'))
    const max = Number.parseInt(`9`.padEnd(length, '9'))
    return ArrUtil.join(
      [options?.prefix, this.randomNumber({ min, max }).toString(), options?.suffix],
      {
        delimiter: '',
        allowEmpty: false,
      },
    )
  }

  randomString(length: number, options?: IStringRandomOptions): string {
    const rString = options?.safe
      ? options?.numeric
        ? new RandExp(`[A-Z0-9]{${length},${length}}`).gen()
        : new RandExp(`[A-Z]{${length},${length}}`).gen()
      : new RandExp(`\\w{${length},${length}}`).gen()

    return ArrUtil.join(
      [options?.prefix, options?.upperCase ? rString.toUpperCase() : rString, options?.suffix],
      { delimiter: '', allowEmpty: false },
    )
  }

  censorString(text: string): string {
    if (text.length <= 5) {
      const stringCensor = '*'.repeat(text.length - 1)
      return `${stringCensor}${text.slice(-1)}`
    } else if (text.length <= 10) {
      const stringCensor = '*'.repeat(text.length - 3)
      return `${stringCensor}${text.slice(-3)}`
    } else if (text.length <= 25) {
      const lengthExplicit = Math.ceil((text.length / 100) * 30)
      const lengthCensor = Math.ceil((text.length / 100) * 50)
      const stringCensor = '*'.repeat(lengthCensor)
      return `${stringCensor}${text.slice(-lengthExplicit)}`
    }
    const stringCensor = '*'.repeat(10)
    const lengthExplicit = Math.ceil((text.length / 100) * 30)
    return `${text.slice(0, 3)}${stringCensor}${text.slice(-lengthExplicit)}`
  }

  stringFormat(text: string, options: IStringFormatOptions) {
    return StrUtil.format(text, options)
  }

  dirtyString(text: string, dirty?: string | number): string {
    if (!text) return text
    dirty = dirty ?? new Date().getTime()
    return ArrUtil.join([text, dirty], { delimiter: '_' })
  }

  padZero(text: string | number, options: IStringPadZeroOptions): string {
    const prefix = options?.prefix ? options.prefix : ''
    const fillLength = Math.max(0, options.length - prefix.length)

    return prefix + `${text}`.padStart(fillLength, '0')
  }

  checkUrlMatchesPatterns(url: string, patterns: string[]): boolean {
    if (!url || !patterns?.length) {
      return false
    }

    let pathname: string
    try {
      const urlObj = new URL(url)
      pathname = urlObj.pathname
    } catch {
      pathname = url.split('?')[0].split('#')[0]
    }

    const normalizedPath = pathname.toLowerCase()

    return patterns.some(pattern => {
      if (!pattern) {
        return false
      }

      const normalizedPattern = pattern.toLowerCase()

      if (normalizedPath === normalizedPattern) {
        return true
      }

      if (!pattern.includes('*')) {
        return false
      }

      try {
        if (normalizedPattern === '*') {
          return true
        }

        if (normalizedPattern.endsWith('*')) {
          const basePattern = normalizedPattern.slice(0, -1)

          if (!basePattern) {
            return true
          }

          if (basePattern.endsWith('/')) {
            return normalizedPath.startsWith(basePattern)
          }

          return normalizedPath === basePattern || normalizedPath.startsWith(basePattern + '/')
        }

        const regexPattern = normalizedPattern
          .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
          .replace(/\*/g, '.*')

        const regex = new RegExp(`^${regexPattern}$`)
        return regex.test(normalizedPath)
      } catch {
        return false
      }
    })
  }

  createPhone(phone: string, country?: string): string {
    return `${country ?? ''}${phone}`
  }

  parsePhone(phone: string): { country: string; phone: string } {
    const country = Object.values(EnumCountryCode).find(code => phone.startsWith(code)) || ''
    return {
      country,
      phone: phone.slice(country.length).trim(),
    }
  }

  dateNow(zeroMs?: boolean): Date {
    return zeroMs === true
      ? DateUtil.current().set({ millisecond: 0 }).toJSDate()
      : DateUtil.current().toJSDate()
  }

  dateStart(): Date {
    const nowDate = this.dateNow()
    return this.dateCreate(nowDate, { startOfDay: true })
  }

  dateEnd(): Date {
    const nowDate = this.dateNow()
    return this.dateCreate(nowDate, { endOfDay: true })
  }

  dateCreate(date: Date, options?: IDateCreateOptions): Date {
    return DateUtil.create(date, options).toJSDate()
  }

  dateInstance(date: Date, options?: IDateCreateOptions): DateTime {
    return DateUtil.create(date, options)
  }

  dateCreateFromGeneric(date: string | Date, options?: IDateCreateOptions): Date {
    if (typeof date === 'string') {
      return this.dateCreateFromIso(date, options)
    }
    return this.dateCreate(date, options)
  }

  dateCreateFromIso(iso: string, options?: IDateCreateOptions): Date {
    const timezone = options?.timezone ?? ScopeContext.getReqZone()
    let mDate = DateTime.fromISO(iso).setZone(timezone)

    if (options?.startOfDay) {
      mDate = mDate.startOf('day')
    } else if (options?.endOfDay) {
      mDate = mDate.endOf('day')
    } else if (options?.durationSet) {
      mDate = mDate.set(options.durationSet)
    }

    return mDate.toJSDate()
  }

  dateGetZone(date: Date): string {
    return DateTime.fromJSDate(date).setZone(ScopeContext.getReqZone()).zone.name
  }

  dateGetZoneOffset(date: Date): string {
    return DateTime.fromJSDate(date).setZone(ScopeContext.getReqZone()).offsetNameShort
  }

  dateGetTimestamp(date: Date): number {
    return DateTime.fromJSDate(date).setZone(ScopeContext.getReqZone()).toMillis()
  }

  dateFormat(date: Date, dateFormat: EnumDateFormat): string {
    return DateUtil.format(date, { format: dateFormat })
  }

  dateRange(date: Date): IDateRange {
    return DateUtil.rangeDate(date)
  }

  dateExtract(date: Date): IDateExtractData {
    return DateUtil.extractDate(date)
  }

  dateSet(date: Date, units: DateObjectUnits): Date {
    return DateTime.fromJSDate(date).setZone(ScopeContext.getReqZone()).set(units).toJSDate()
  }

  dateForward(date: Date, duration: DurationLikeObject): Date {
    return DateTime.fromJSDate(date)
      .setZone(ScopeContext.getReqZone())
      .plus(Duration.fromObject(duration))
      .toJSDate()
  }

  dateBackward(date: Date, duration: DurationLikeObject): Date {
    return DateTime.fromJSDate(date)
      .setZone(ScopeContext.getReqZone())
      .minus(Duration.fromObject(duration))
      .toJSDate()
  }

  dateCheckAfter(dateOne: Date, options?: IDateCompareOptions): boolean {
    const dtDateOne = DateUtil.create(dateOne)
    const dtDateTwo = DateUtil.create(options?.sinceDate, {
      ...options,
      timezone: this.dateGetZone(dtDateOne.toJSDate()),
    })
    return dtDateTwo > dtDateOne
  }

  dateCheckBefore(dateOne: Date, options?: IDateCompareOptions): boolean {
    const dtDateOne = DateUtil.create(dateOne)
    const dtDateTwo = DateUtil.create(options?.sinceDate, {
      ...options,
      timezone: this.dateGetZone(dtDateOne.toJSDate()),
    })
    return dtDateTwo < dtDateOne
  }

  dateCheckSet(date: Date, options: Partial<Omit<IDateExtractData, 'date'>>): boolean {
    const extractDate = this.dateExtract(date)
    if (options?.year && extractDate.year != options.year) return false
    if (options?.month && extractDate.month != options.month) return false
    if (options?.day && extractDate.day != options.day) return false
    if (options?.weekday && extractDate.weekday != options.weekday) return false
    if (options?.hour && extractDate.hour != options.hour) return false
    if (options?.minute && extractDate.minute != options.minute) return false
    if (options?.second && extractDate.second != options.second) return false
    return true
  }

  dateCheckIso(date: string): boolean {
    return DateTime.fromISO(date).setZone(ScopeContext.getReqLang()).isValid
  }

  dateCheckTimestamp(timestamp: number): boolean {
    return DateTime.fromMillis(timestamp).setZone(ScopeContext.getReqLang()).isValid
  }

  dateCheckZone(timezone: string): boolean {
    return DateTime.fromObject({}, { zone: timezone }).isValid
  }

  baseEncode(data: string, base: 10 | 16 | 36 | 62 = 62): string {
    const chars = this.BASE_CHARS[base]
    if (!chars) throw new Error('Unsupported base')

    // string → BigInt
    let num = BigInt('0x' + Buffer.from(data, 'utf8').toString('hex'))

    if (num === 0n) return chars[0]

    let result = ''
    const baseBigInt = BigInt(base)

    while (num > 0) {
      result = chars[Number(num % baseBigInt)] + result
      num = num / baseBigInt
    }

    return result
  }

  baseDecode(encoded: string, base: 10 | 16 | 36 | 62 = 62): string {
    const chars = this.BASE_CHARS[base]
    if (!chars) throw new Error('Unsupported base')

    let num = 0n
    const baseBigInt = BigInt(base)

    for (const c of encoded) {
      const index = chars.indexOf(c)
      if (index === -1) {
        throw new Error(`Invalid character '${c}' for base ${base}`)
      }
      num = num * baseBigInt + BigInt(index)
    }

    // BigInt → hex → string
    let hex = num.toString(16)
    if (hex.length % 2 !== 0) hex = '0' + hex

    return Buffer.from(hex, 'hex').toString('utf8')
  }

  base64Encrypt(data: string): string {
    const buff: Buffer = Buffer.from(data, 'utf8')
    return buff.toString('base64')
  }

  base64Decrypt(encrypted: string): string {
    const buff: Buffer = Buffer.from(encrypted, 'base64')
    return buff.toString('utf8')
  }

  aes256Encrypt(data: string, options: { key: string; iv: string }): string {
    const keyBuffer = Buffer.from(options.key, 'utf-8')
    const ivBuffer = Buffer.from(options.iv, 'utf-8')

    const cipher = createCipheriv('aes-256-cbc', keyBuffer, ivBuffer)

    return cipher.update(data, 'utf8', 'base64') + cipher.final('base64')
  }

  aes256Decrypt(encrypted: string, options: { key: string; iv: string }): string {
    const keyBuffer = Buffer.from(options.key, 'utf-8')
    const ivBuffer = Buffer.from(options.iv, 'utf-8')

    const decipher = createDecipheriv('aes-256-cbc', keyBuffer, ivBuffer)

    return decipher.update(encrypted, 'base64', 'utf8') + decipher.final('utf8')
  }

  randomSalt(length: number): string {
    return genSaltSync(length)
  }

  bcryptCreate(data: string, salt: string): string {
    return hashSync(data, salt)
  }

  bcryptCompare(data: string, bcrypted: string): boolean {
    return compareSync(data, bcrypted || '')
  }

  hashCreate(data: string, options: IEncryptionHashOptions): string {
    const { algorithm, ...hashOpts } = options

    const hash = createHash(algorithm, hashOpts)

    hash.update(data, 'utf8')

    const hexDigest = hash.digest(options?.encoding ?? 'hex')

    return hexDigest
  }

  hashCompare(data: string, hashed: string, options: IEncryptionHashOptions): boolean {
    return hashed === this.hashCreate(data, options)
  }

  hmacCreate(data: string, options: IEncryptionHmacOptions): string {
    const { algorithm, key, length = 12, ...hmacOpts } = options
    const matches = this.BASE_CHARS[62]

    const hmac = createHmac(algorithm, key, hmacOpts)

    hmac.update(data, 'utf8')

    const hexDigest = hmac.digest('hex')

    let hmacValue = ''
    let hmacDigit = parseInt(hexDigest, 16)

    for (let i = 0; i < length; i++) {
      hmacValue += [hmacDigit % matches.length]
      hmacDigit = Math.floor(hmacDigit / matches.length) // Move to the next "digit"
    }

    return hmacValue
  }

  hmacCompare(data: string, hmac: string, options: IEncryptionHmacOptions): boolean {
    return hmac === this.hmacCreate(data, options)
  }

  signatureCreate(data: string, options: IEncryptionSignOptions): string {
    const signer = createSign(options.algorithm)
    signer.update(data)
    signer.end?.()
    return signer.sign(options.privateKey, options.encoding)
  }

  signatureVerify(data: string, options: IEncryptionVerifyOptions): boolean {
    const verify = createVerify(options.algorithm)
    verify.update(data)
    return verify.verify(options.publicKey, options.signature, options.encoding)
  }

  createUserToken(userIp: string, userAgent: IResult, userRotate: boolean = false): string {
    const { ua, browser, device, engine, os, cpu } = userAgent
    const randToken = userRotate ? this.randomString(30) : ''

    return this.hashCreate(
      [
        JSON.stringify(browser),
        JSON.stringify(device),
        JSON.stringify(engine),
        JSON.stringify(os),
        JSON.stringify(cpu),
        ua,
        userIp,
        randToken,
      ].join('|'),
      { algorithm: 'sha256' },
    )
  }

  createUserHmac(userId: number, options: { key: string }): string {
    const nowDate = this.dateNow()
    const timestamp = this.dateGetTimestamp(nowDate)

    const md5 = this.hmacCreate(userId.toString(), { algorithm: 'md5', key: options.key })
    const sha256 = this.hmacCreate(timestamp.toString(), { algorithm: 'sha256', key: options.key })
    return ArrUtil.join([md5, sha256, timestamp], { delimiter: ':' })
  }

  verifyUserHmac(userId: number, options: { key: string; hmac: string }): boolean {
    const [md5, sha256, timestamp] = options.hmac.split(':')

    if (!this.hmacCompare(userId.toString(), md5, { algorithm: 'md5', key: options.key })) {
      return false
    }
    return this.hmacCompare(timestamp.toString(), sha256, { algorithm: 'sha256', key: options.key })
  }
}
