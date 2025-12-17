import { CartItem } from '@prisma/client'

export class CartUtil {
  static recalculate(item: CartItem, quantity: number): CartItem {
    const unitPrice = item.unitPrice || 0
    const discPrice = item.discPrice || 0
    const unitPoint = item.unitPoint || 0
    const discPoint = item.discPoint || 0

    const finalPrice = (unitPrice - discPrice) * quantity
    const finalPoint = (unitPoint - discPoint) * quantity

    return { ...item, quantity, finalPrice, finalPoint }
  }
}
