import { Transform } from 'class-transformer'

export function ToInWishList(): (target: any, key: string) => void {
  return Transform(({ obj }: any) => {
    if ('wishlist' in obj) {
      return obj.wishlist.length > 0
    }
    return undefined
  })
}
