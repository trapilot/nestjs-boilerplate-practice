import { ENUM_PRODUCT_EXPIRY } from '@prisma/client'
import { Transform } from 'class-transformer'
import { IDateRequestOptions, NestHelper } from 'lib/nest-core'

export function ToDynamicExpiryDays(): (target: any, key: string) => void {
  return Transform(({ obj, value }: any) => {
    if (obj.expiryType === ENUM_PRODUCT_EXPIRY.DYNAMIC) {
      if (typeof value === 'string') {
        return Number(value)
      }
      return value
    }
    return value
  })
}

export function ToStaticExpiryDate(
  options?: IDateRequestOptions,
): (target: any, key: string) => void {
  return Transform(({ obj, value }: any) => {
    if (obj.expiryType === ENUM_PRODUCT_EXPIRY.STATIC) {
      return value ? NestHelper.toDate(value, options) : value
    }
    return value
  })
}

export function ToDynamicExpiryDate(
  options?: IDateRequestOptions,
): (target: any, key: string) => void {
  return Transform(({ obj }: any) => {
    if (obj.expiryType === ENUM_PRODUCT_EXPIRY.DYNAMIC && obj?.dynamicExpiryDays) {
      const dynamicDate = new Date()
      dynamicDate.setDate(dynamicDate.getDate() + obj.dynamicExpiryDays)
      return NestHelper.toDate(dynamicDate, options)
    }
    return null
  })
}
