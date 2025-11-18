import { Transform } from 'class-transformer'
import { AppHelper } from 'lib/nest-core'
import { TCart, TCartItem } from '../interfaces'

export function ToOutOfStockStatus(): (target: any, key: string) => void {
  return Transform(({ obj }: { obj: TCartItem }) => {
    return obj.product.stockQty - obj.product.paidQty - obj.product.unpaidQty <= obj.quantity
  })
}

export function ToOutOfStockSale(): (target: any, key: string) => void {
  return Transform(({ obj }: { obj: TCartItem }) => {
    return !obj.product.isActive
  })
}

export function ToUnitPrice(): (target: any, key: string) => void {
  return Transform(({ obj, value }: { obj: TCartItem; value: number }) => {
    if (value === undefined || value === null) {
      return AppHelper.toNumber(obj.product.salePrice, { useGrouping: true })
    }
    return value
  })
}

export function ToUnitPoint(): (target: any, key: string) => void {
  return Transform(({ obj, value }: { obj: TCartItem; value: number }) => {
    if (value === undefined || value === null) {
      return AppHelper.toNumber(obj.product.salePoint, { useGrouping: true })
    }
    return value
  })
}

export function ToFinalPrice(): (target: any, key: string) => void {
  return Transform(({ obj }: { obj: TCartItem }) => {
    const unitPrice = obj?.unitPrice >= 0 ? obj?.unitPrice : obj.product.salePrice
    return AppHelper.toNumber(unitPrice * obj.quantity, { useGrouping: true })
  })
}

export function ToFinalPoint(): (target: any, key: string) => void {
  return Transform(({ obj }: { obj: TCartItem }) => {
    const unitPoint = obj?.unitPoint >= 0 ? obj?.unitPoint : obj.product.salePoint
    return AppHelper.toNumber(unitPoint * obj.quantity, { useGrouping: true })
  })
}

export function ToCartPrice(): (target: any, key: string) => void {
  return Transform(({ obj }: { obj: TCart }) => {
    const cartPrice = obj.items.reduce((sum: number, item: TCartItem) => {
      const unitPrice = item?.unitPrice >= 0 ? item?.unitPrice : item.product.salePrice
      return sum + item.quantity * unitPrice
    }, 0)
    return AppHelper.toNumber(cartPrice, { useGrouping: true })
  })
}

export function ToCartPoint(): (target: any, key: string) => void {
  return Transform(({ obj }: { obj: TCart }) => {
    const cartPoint = obj.items.reduce((sum: number, item: TCartItem) => {
      const unitPoint = item?.unitPoint >= 0 ? item?.unitPoint : item.product.salePoint
      return sum + item.quantity * unitPoint
    }, 0)
    return AppHelper.toNumber(cartPoint, { useGrouping: true })
  })
}

export function ToShipment(): (target: any, key: string) => void {
  return Transform(({ obj }: { obj: TCart }) => {
    const hasShipment = obj.items.find((item) => item?.product?.hasShipment)
    return !!hasShipment
  })
}
