import { Injectable } from '@nestjs/common'
import { isStrongPassword } from 'class-validator'
import RandExp from 'randexp'
import { ENUM_COUNTRY_CODE } from '../enums'
import { AppHelper } from '../helpers'
import {
  IStringCurrencyOptions,
  IStringEmailValidation,
  IStringNumericOptions,
  IStringPasswordOptions,
  IStringRandomOptions,
} from '../interfaces'

@Injectable()
export class HelperStringService {
  randomReference(length: number): string {
    const timestamp = `${new Date().getTime()}`
    const randomString: string = this.random(length, {
      safe: true,
      upperCase: true,
    })

    return `${timestamp}${randomString}`
  }

  random(length: number, options?: IStringRandomOptions): string {
    if (options?.numeric) {
      return new RandExp(`[0-9]{${length},${length}}`).gen()
    }

    let rString = options?.safe
      ? new RandExp(`[A-Z]{${length},${length}}`).gen()
      : new RandExp(`\\w{${length},${length}}`).gen()

    if (options?.upperCase) {
      rString = rString.toUpperCase()
    }

    return options?.prefix ? `${options.prefix}${rString}` : rString
  }

  censor(text: string): string {
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

  checkRegExp(text: string, regex: RegExp): boolean {
    return regex.test(text)
  }

  checkEmail(value: string): IStringEmailValidation {
    const regex = new RegExp(/\S@\S\.\S/)
    const valid = regex.test(value)
    if (!valid) {
      return {
        validated: false,
        message: 'request.email.invalid',
      }
    }

    const atSymbolCount = (value.match(/@/g) || []).length
    if (atSymbolCount !== 1) {
      return {
        validated: false,
        message: 'request.email.multipleAtSymbols',
      }
    }

    const [localPart, domain] = value.split('@')

    // Add minimum length check for local part
    if (!localPart || localPart.length === 0) {
      return {
        validated: false,
        message: 'request.email.localPartNotEmpty',
      }
    } else if (!domain || domain.length > 255) {
      return {
        validated: false,
        message: 'request.email.domainLength',
      }
    } else if (localPart.length > 64) {
      return {
        validated: false,
        message: 'request.email.localPartMaxLength',
      }
    } else if (localPart.startsWith('.') || localPart.endsWith('.')) {
      return {
        validated: false,
        message: 'request.email.localPartDot',
      }
    } else if (localPart.includes('..')) {
      return {
        validated: false,
        message: 'request.email.consecutiveDots',
      }
    }

    const allowedLocalPartChars = /^[a-zA-Z0-9-_.]$/
    if (!allowedLocalPartChars.test(localPart)) {
      return {
        validated: false,
        message: 'request.email.invalidChars',
      }
    }

    return
  }

  checkPassword(password: string, options?: IStringPasswordOptions): boolean {
    const minLength = options?.minLength ?? 6
    const maxLength = options?.maxLength ?? 50
    return password.length <= maxLength && isStrongPassword(password, { minLength, ...options })
  }

  checkSafeString(text: string): boolean {
    const regex = new RegExp('^[A-Za-z0-9_-]+$')
    return regex.test(text)
  }

  checkWildcardUrl(url: string, patterns: string[]): boolean {
    if (patterns.includes(url)) {
      return true
    }

    return patterns.some((pattern) => {
      if (pattern.includes('*')) {
        try {
          // Convert wildcard pattern to regex pattern
          const regexPattern = pattern
            .replace(/\./g, '\\.') // Escape dots
            .replace(/\*/g, '.*') // Replace * with .*

          // Create regex and test URL
          const regex = new RegExp(`^${regexPattern}$`)
          return regex.test(url)
        } catch {
          return false
        }
      }
      return false
    })
  }

  checkDuration(duration: string, LOGGER_EXCLUDED_ROUTES: string[]): boolean {
    const regex = new RegExp(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
    return regex.test(duration)
  }

  checkMACAddress(mac: string): boolean {
    const regex = new RegExp(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/)
    return regex.test(mac)
  }

  checkCardId(text: string): boolean {
    if (text && text.length < 8) {
      return false
    }

    text = text.toUpperCase()
    const strValidChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const IdPattern = /^([A-Z]{1,2})\s?([0-9]{6})\s?([A0-9]|\([A0-9]\))$/
    const matches = text.match(IdPattern)
    if (matches === null) {
      return false
    }

    const charPart = matches[1] as any
    const numbPart = matches[2] as any
    const chkDigit = matches[3].replace(/[^a-zA-Z0-9]/g, '') as any

    let checkSum = 0
    if (charPart.length == 2) {
      checkSum += 9 * (10 + strValidChars.indexOf(charPart.charAt(0)))
      checkSum += 8 * (10 + strValidChars.indexOf(charPart.charAt(1)))
    } else {
      checkSum += 9 * 36
      checkSum += 8 * (10 + strValidChars.indexOf(charPart))
    }
    for (let i = 0, j = 7; i < numbPart.length; i++, j--) {
      checkSum += j * numbPart.charAt(i)
    }
    const remaining = checkSum % 11
    const verify = remaining == 0 ? 0 : 11 - remaining
    return verify == chkDigit || (verify == 10 && chkDigit == 'A')
  }

  formatCurrency(number: number, options?: IStringCurrencyOptions): string {
    return AppHelper.toCurrency(number, options)
  }

  formatNumber(number: number, options?: IStringNumericOptions) {
    return AppHelper.toNumber(number, options)
  }

  boolean(value: number | string | boolean): boolean {
    return ['1', 'y', 'yes', 'ok', 'true'].includes((value + '').toLowerCase())
  }

  kebabCase(word: string): string {
    return word
      .replace(/\W+/g, ' ')
      .split(/ |\B(?=[A-Z])/)
      .map((word) => word.toLowerCase())
      .join('_')
  }

  camelCase(word: string): string {
    return word
      .replace(/\s(.)/g, ($1) => $1.toUpperCase())
      .replace(/\s/g, '')
      .replace(/^(.)/, ($1) => $1.toLowerCase())
  }

  capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
  }

  dirty(text: string, suffix?: string | number): string {
    if (!text) return text
    suffix = suffix ?? new Date().getTime()
    return [text, suffix].join('_')
  }

  slugify(text: string): string {
    return String(text)
      .normalize('NFKD') // split accented characters into their base characters and diacritical marks
      .replace(/[\u0300-\u036f]/g, '') // remove all the accents, which happen to be all in the \u03xx UNICODE block.
      .trim() // trim leading or trailing whitespace
      .toLowerCase() // convert to lowercase
      .replace(/[^a-z0-9 -]/g, '') // remove non-alphanumeric characters
      .replace(/\s+/g, '-') // replace spaces with hyphens
      .replace(/-+/g, '-') // remove consecutive hyphens
  }

  code(text: string, replaceWith: string = '_'): string {
    const searchRegExp = /\s/g
    return text.toUpperCase().replace(searchRegExp, replaceWith)
  }

  padZero(text: string | number, length: number = 1, prefix: string = ''): string {
    return prefix + `${text}`.padStart(Math.max(length, `${text}`.length), '0')
  }

  leadZero(number: number, prefix: string = ''): string {
    return prefix + (number < 10 ? `0${number}` : number.toString())
  }

  createPhone(country: string, phone?: string): string {
    return `${country ?? ''}${phone}`
  }

  parsePhone(phone: string): { country: string; phone: string } {
    const country = Object.values(ENUM_COUNTRY_CODE).find((code) => phone.startsWith(code)) || ''
    return {
      country,
      phone: phone.slice(country.length).trim(),
    }
  }
}
