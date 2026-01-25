import { EnumProductExpiryType } from '@runtime/prisma-client'
import { Transform } from 'class-transformer'
import { DateUtil, IDateFormatOptions } from 'lib/nest-core'
import { TProduct } from '../interfaces'

export function ToDynamicExpiryDays(): (target: object, key: string) => void {
  return Transform(({ obj, value }: { obj: TProduct; value: Date }) => {
    if (obj.expiryType === EnumProductExpiryType.DYNAMIC) {
      if (typeof value === 'string') {
        return Number(value)
      }
      return value
    }
    return value
  })
}

export function ToStaticExpiryDate(
  options?: IDateFormatOptions,
): (target: object, key: string) => void {
  return Transform(({ obj, value }: { obj: TProduct; value: Date }) => {
    if (obj.expiryType === EnumProductExpiryType.STATIC) {
      return value ? DateUtil.format(value, options) : value
    }
    return value
  })
}

export function ToDynamicExpiryDate(
  options?: IDateFormatOptions,
): (target: object, key: string) => void {
  return Transform(({ obj }: { obj: TProduct }) => {
    if (obj.expiryType === EnumProductExpiryType.DYNAMIC && obj?.dynamicExpiryDays) {
      const dynamicDate = new Date()
      dynamicDate.setDate(dynamicDate.getDate() + obj.dynamicExpiryDays)
      return DateUtil.format(dynamicDate, options)
    }
    return null
  })
}
