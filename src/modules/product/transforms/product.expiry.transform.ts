import { EnumProductExpiryType } from '@runtime/prisma-client'
import { Transform } from 'class-transformer'
import { DateUtil, IDateFormatOptions } from 'lib/nest-core'

export function ToDynamicExpiryDays(): (target: any, key: string) => void {
  return Transform(({ obj, value }: any) => {
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
): (target: any, key: string) => void {
  return Transform(({ obj, value }: any) => {
    if (obj.expiryType === EnumProductExpiryType.STATIC) {
      return value ? DateUtil.format(value, options) : value
    }
    return value
  })
}

export function ToDynamicExpiryDate(
  options?: IDateFormatOptions,
): (target: any, key: string) => void {
  return Transform(({ obj }: any) => {
    if (obj.expiryType === EnumProductExpiryType.DYNAMIC && obj?.dynamicExpiryDays) {
      const dynamicDate = new Date()
      dynamicDate.setDate(dynamicDate.getDate() + obj.dynamicExpiryDays)
      return DateUtil.format(dynamicDate, options)
    }
    return null
  })
}
