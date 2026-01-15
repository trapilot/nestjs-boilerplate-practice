import { ApiProperty, IntersectionType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { ToDate, ToDecimal } from 'lib/nest-core'
import { ResponseUserBelongDto } from 'lib/nest-web'
import { ProductResponseBelongDto } from 'modules/product'
import { ToOutOfStockSale, ToOutOfStockStatus } from '../transforms'

class ResponseDataDetailDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  id: number

  @ApiProperty({ example: null })
  @Type(() => Number)
  @Expose()
  cartId: number

  @ApiProperty({ example: null })
  @Type(() => Number)
  @Expose()
  promotionId: number

  @ApiProperty({ example: null })
  @Type(() => Number)
  @Expose()
  offerId: number

  @ApiProperty({ example: null })
  @Type(() => Number)
  @Expose()
  bundleId: number

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  productId: number

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  quantity: number

  @ApiProperty({ example: '0' })
  @ToDecimal()
  @Expose()
  unitPrice: string

  @ApiProperty({ example: '0' })
  @ToDecimal()
  @Expose()
  unitPoint: string

  @ApiProperty({ example: '0' })
  @ToDecimal()
  @Expose()
  discPrice: string

  @ApiProperty({ example: '0' })
  @ToDecimal()
  @Expose()
  discPoint: string

  @ApiProperty({ example: '0' })
  @ToDecimal()
  @Expose()
  finalPrice: string

  @ApiProperty({ example: '0' })
  @ToDecimal()
  @Expose()
  finalPoint: string

  @ApiProperty({ example: false })
  @ToOutOfStockStatus()
  @Expose()
  isOutOfStock: boolean

  @ApiProperty({ example: false })
  @ToOutOfStockSale()
  @Expose()
  isOutOfSale: boolean

  @ApiProperty({ example: new Date(Date.now() - 30000 * 3600) })
  @ToDate()
  @Expose()
  createdAt: Date

  @ApiProperty({ example: new Date(Date.now() - 1000 * 3600) })
  @ToDate()
  @Expose()
  updatedAt: Date
}

class ResponseDataRelationDto extends ResponseUserBelongDto {
  @ApiProperty({ type: ProductResponseBelongDto })
  @Type(() => ProductResponseBelongDto)
  @Expose()
  product: ProductResponseBelongDto
}

export class CartItemResponseDetailDto extends IntersectionType(
  ResponseDataDetailDto,
  ResponseDataRelationDto
) {}
