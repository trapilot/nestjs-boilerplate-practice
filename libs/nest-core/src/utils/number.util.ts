import { ENUM_MESSAGE_LANGUAGE, ENUM_NUMBER_CURRENCY, ENUM_NUMBER_LOCALE } from '../enums'
import { AppContext } from '../helpers'
import { INumberFormatOptions } from '../interfaces'
import { EnumUtil } from './enum.util'

export class NumberUtil {
  static format(number: number, options: INumberFormatOptions): string {
    const currLang = options?.language || AppContext.language()

    const formatter = new Intl.NumberFormat(
      EnumUtil.relative(currLang, {
        enumRoot: ENUM_MESSAGE_LANGUAGE,
        enumRelative: ENUM_NUMBER_LOCALE,
      }),
      {
        style: options.style,
        currency:
          options.style === 'currency'
            ? EnumUtil.relative(currLang, {
                enumRoot: ENUM_MESSAGE_LANGUAGE,
                enumRelative: ENUM_NUMBER_CURRENCY,
              })
            : undefined,
        minimumFractionDigits: options?.minimumFractionDigits,
        maximumFractionDigits: options?.maximumFractionDigits ?? 10,
        currencyDisplay: currLang === options?.language ? 'narrowSymbol' : undefined,
        useGrouping: options?.useGrouping ?? false,
      },
    )
    return formatter.format(number)
  }

  static percent(number: number, options: Omit<INumberFormatOptions, 'style'>): string {
    return this.format(number, {
      ...options,
      style: 'percent',
    })
  }

  static decimal(number: number, options: Omit<INumberFormatOptions, 'style'>): string {
    return this.format(number, {
      ...options,
      style: 'decimal',
    })
  }

  static currency(number: number, options: Omit<INumberFormatOptions, 'style'>): string {
    return this.format(number, {
      ...options,
      style: 'currency',
    })
  }
}
