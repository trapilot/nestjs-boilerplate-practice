import { CartItem } from '@runtime/prisma-client'
import { ICartSnapshot, TCartItem } from '../interfaces/cart.interface'

export class CartUtil {
  static calculate(items: TCartItem[]): ICartSnapshot {
    let finalPrice = 0
    let finalPoint = 0

    for (const item of items) {
      finalPrice += item.product.salePrice * item.quantity
      finalPoint += item.product.salePoint * item.quantity
    }

    return {
      tax: 0,
      shipping: 0,
      price: finalPrice,
      point: finalPoint,
    }
  }

  static recalculate(item: CartItem, quantity: number): CartItem {
    const unitPrice = item.unitPrice || 0
    const discPrice = item.discPrice || 0
    const unitPoint = item.unitPoint || 0
    const discPoint = item.discPoint || 0

    const finalPrice = (unitPrice - discPrice) * quantity
    const finalPoint = (unitPoint - discPoint) * quantity

    return {
      ...item,
      quantity,
      finalPrice,
      finalPoint,
    }
  }
}
