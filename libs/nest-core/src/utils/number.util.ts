import { MESSAGE_FALLBACK } from '../constants'
import { ENUM_CURRENCY_LANGUAGE, ENUM_MESSAGE_LANGUAGE, ENUM_NUMBER_LANGUAGE } from '../enums'
import { IStringCurrencyOptions, IStringNumericOptions } from '../interfaces'
import { EnumUtil } from './enum.util'

export class NumberUtil {
  static integer(number: number | string | any, def: number = undefined): number {
    return isNaN(number) ? def : Number.parseInt(number)
  }

  static numeric(number: number, options?: IStringNumericOptions): string {
    const locale = EnumUtil.getEnumKey(options?.language, {
      enum: ENUM_MESSAGE_LANGUAGE,
      fallback: MESSAGE_FALLBACK,
    })
    const formatter = new Intl.NumberFormat(ENUM_NUMBER_LANGUAGE[locale], {
      minimumFractionDigits: options?.minimumFractionDigits,
      maximumFractionDigits: options?.maximumFractionDigits ?? 10,
      useGrouping: options?.useGrouping === true,
    })
    return formatter.format(number).trim()
  }

  static currency(number: number, options?: IStringCurrencyOptions): string {
    const locale = EnumUtil.getEnumKey(options?.language, {
      enum: ENUM_MESSAGE_LANGUAGE,
      fallback: MESSAGE_FALLBACK,
    })
    const formatter = new Intl.NumberFormat(ENUM_NUMBER_LANGUAGE[locale], {
      style: 'currency',
      currency: ENUM_CURRENCY_LANGUAGE[locale],
      minimumFractionDigits: options?.minimumFractionDigits,
      maximumFractionDigits: options?.maximumFractionDigits ?? 10,
      currencyDisplay: options?.language === MESSAGE_FALLBACK ? 'narrowSymbol' : undefined,
      useGrouping: options?.useGrouping ?? false,
    })
    return formatter.format(number).trim()
  }
}
