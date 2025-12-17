import { faker } from '@faker-js/faker'
import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { ENUM_PRODUCT_EXPIRY } from '@prisma/client'
import { Expose, Type } from 'class-transformer'
import { ENUM_DATE_FORMAT, ToDecimal, ToLocaleField, ToUrl } from 'lib/nest-core'
import { ResponseLocaleDto, ResponseUserBelongDto } from 'lib/nest-web'
import { ProductBrandResponseBelongDto } from 'modules/product-brand/dtos'
import { ProductCategoryResponseBelongDto } from 'modules/product-category/dtos'
import { ToDynamicExpiryDate, ToInWishList, ToStaticExpiryDate } from '../transforms'

class ResponseDataDetailDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  id: number

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  brandId: number

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  categoryId: number

  @ApiProperty({ example: 'P01' })
  @Type(() => String)
  @Expose()
  sku: string

  @ApiProperty({ example: faker.image.url() })
  @ToUrl()
  @Expose()
  thumbnail: string

  @ApiProperty({ type: ResponseLocaleDto })
  @Type(() => ResponseLocaleDto)
  @Expose()
  name: ResponseLocaleDto

  @ApiProperty({ type: [ResponseLocaleDto] })
  @ToLocaleField({ type: ResponseLocaleDto })
  @Expose()
  content: ResponseLocaleDto

  @ApiProperty({ type: [ResponseLocaleDto] })
  @ToLocaleField({ type: ResponseLocaleDto })
  @Expose()
  termAndCond: ResponseLocaleDto

  @ApiProperty({ example: 0 })
  @ToDecimal()
  @Expose()
  salePoint: number

  @ApiProperty({ example: 100 })
  @ToDecimal()
  @Expose()
  salePrice: number

  @ApiProperty({ example: 100 })
  @ToDecimal()
  @Expose()
  costPrice: number

  @Type(() => Number)
  @Expose()
  @ApiProperty({ required: true, example: 99 })
  stockQty: number

  @Type(() => Number)
  @Expose()
  @ApiProperty({ required: true, example: 0 })
  paidQty: number

  @Type(() => Number)
  @Expose()
  @ApiProperty({ required: true, example: 0 })
  unpaidQty: number

  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @Expose()
  salePerPerson: number

  @ApiProperty({ example: 0 })
  @Type(() => Number)
  @Expose()
  sorting: number

  @ApiProperty({ example: 0 })
  @Type(() => Number)
  @Expose()
  duePaidDays: number

  @ApiProperty({ enum: ENUM_PRODUCT_EXPIRY, example: ENUM_PRODUCT_EXPIRY.STATIC })
  @Type(() => String)
  @Expose()
  expiryType: ENUM_PRODUCT_EXPIRY

  @ApiProperty({ example: 0 })
  @Type(() => Number)
  @Expose()
  dynamicExpiryDays: number

  @ApiProperty({ example: faker.date.future() })
  @ToDynamicExpiryDate({ format: ENUM_DATE_FORMAT.DATE })
  @Expose()
  dynamicExpiryDate: string

  @ApiProperty({ example: faker.date.future() })
  @ToStaticExpiryDate({ format: ENUM_DATE_FORMAT.DATE })
  @Expose()
  staticExpiryDate: string

  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @Expose()
  hasShipment: boolean

  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @Expose()
  hasInventory: boolean

  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @Expose()
  hasExpiration: boolean

  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @Expose()
  hasDuePayment: boolean

  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @Expose()
  hasLimitPerson: boolean

  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @Expose()
  isPopular: boolean

  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @Expose()
  isBestSale: boolean

  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @Expose()
  isFlashSale: boolean

  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @Expose()
  isComingSoon: boolean

  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @Expose()
  isNewArrival: boolean

  @ApiProperty({ example: true })
  @ToInWishList()
  @Expose()
  isWishlisted: boolean

  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @Expose()
  isActive: boolean

  @ApiProperty({ example: false })
  @Type(() => Boolean)
  @Expose()
  isDeleted: boolean

  @ApiProperty({ example: faker.date.recent() })
  @Type(() => Date)
  @Expose()
  createdAt: Date

  @ApiProperty({ example: faker.date.soon() })
  @Type(() => Date)
  @Expose()
  updatedAt: Date
}

class ResponseDataRelationDto extends ResponseUserBelongDto {
  @ApiProperty({ type: ProductBrandResponseBelongDto })
  @Type(() => ProductBrandResponseBelongDto)
  @Expose()
  brand: ProductBrandResponseBelongDto

  @ApiProperty({ type: ProductCategoryResponseBelongDto })
  @Type(() => ProductCategoryResponseBelongDto)
  @Expose()
  category: ProductCategoryResponseBelongDto
}

export class ProductResponseDetailDto extends IntersectionType(
  ResponseDataDetailDto,
  ResponseDataRelationDto,
) {}

export class ProductResponseListDto extends IntersectionType(
  OmitType(ResponseDataDetailDto, [] as const),
  ResponseDataRelationDto,
) {}

export class ProductResponseBelongDto extends IntersectionType(
  PickType(ResponseDataDetailDto, [
    'id',
    'name',
    'salePoint',
    'salePrice',
    'stockQty',
    'isActive',
  ] as const),
  ResponseDataRelationDto,
) {}
