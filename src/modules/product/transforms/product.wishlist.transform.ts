import { Transform } from 'class-transformer'

export function ToInWishList(): (target: object, key: string) => void {
  return Transform(({ obj }: { obj: { wishlist?: object[] } }) => {
    if ('wishlist' in obj) {
      return obj.wishlist.length > 0
    }
    return undefined
  })
}
