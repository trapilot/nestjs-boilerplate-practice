import { ApiProperty } from '@nestjs/swagger'
import { EnumExpiryType } from '@runtime/prisma-client'
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator'
import { ToBoolean, ToNumber, ToObject, ToString, TransformIf } from 'lib/nest-core'
import { EnumRequestFormatType, RequestParagraphDto, RequestSentenceDto } from 'lib/nest-web'
import { ToDynamicExpiryDays, ToStaticExpiryDate } from '../transforms/product.expiry.transform'

export class ProductRequestCreateDto {
  @IsNotEmpty()
  @IsNumber()
  @ToNumber()
  @ApiProperty({ required: true, example: 1 })
  brandId: number

  @IsNotEmpty()
  @IsNumber()
  @ToNumber()
  @ApiProperty({ required: true, example: 1 })
  categoryId: number

  @IsNotEmpty()
  @IsString()
  @ToString()
  @ApiProperty({ required: true, example: `P0000005` })
  sku: string

  @IsNotEmpty()
  @IsObject()
  @ToObject({ type: RequestSentenceDto })
  @ApiProperty({
    required: true,
    type: RequestSentenceDto,
  })
  name: object

  @IsNotEmpty()
  @IsObject()
  @ToObject({ type: RequestParagraphDto })
  @ApiProperty({
    required: true,
    type: RequestParagraphDto,
    format: EnumRequestFormatType.HTML,
  })
  termAndCond: object

  @IsNotEmpty()
  @IsObject()
  @ToObject({ type: RequestParagraphDto })
  @ApiProperty({
    type: RequestParagraphDto,
    required: true,
    format: EnumRequestFormatType.HTML,
  })
  content: object

  @IsNotEmpty()
  @IsNumber()
  @ToNumber()
  @ApiProperty({ required: true, example: 0 })
  sorting: number

  @IsNotEmpty()
  @IsNumber()
  @ToNumber()
  @ApiProperty({ required: true, example: 100 })
  salePoint: number

  @IsNotEmpty()
  @IsNumber()
  @ToNumber()
  @ApiProperty({ required: true, example: 100 })
  salePrice: number

  @IsNotEmpty()
  @IsNumber()
  @ToNumber()
  @ApiProperty({ required: true, example: 100 })
  costPrice: number

  @IsNotEmpty()
  @IsNumber()
  @ToNumber()
  @ValidateIf(dto => dto.hasInventory === true)
  @TransformIf((dto: ProductRequestCreateDto) => dto.hasInventory === true)
  @ApiProperty({ required: true, example: 99 })
  stockQty: number

  @IsNotEmpty()
  @IsNumber()
  @ToNumber()
  @ValidateIf(dto => dto.hasLimitPerson === true)
  @TransformIf((dto: ProductRequestCreateDto) => dto.hasLimitPerson === true)
  @ApiProperty({ required: true, example: 0 })
  salePerPerson: number

  @IsNotEmpty()
  @IsNumber()
  @ToNumber()
  @ValidateIf(dto => dto.hasDuePayment === true)
  @TransformIf((dto: ProductRequestCreateDto) => dto.hasDuePayment === true)
  @ApiProperty({ required: true, example: 1 })
  duePaidDays: number

  @IsNotEmpty()
  @IsEnum(EnumExpiryType)
  @ToString()
  @ValidateIf(dto => dto.hasExpiration)
  @TransformIf((dto: ProductRequestCreateDto) => dto.hasExpiration === true)
  @ApiProperty({
    required: true,
    enum: EnumExpiryType,
    enumName: 'EnumExpiryType',
    example: EnumExpiryType.STATIC,
  })
  expiryType: EnumExpiryType

  @IsNotEmpty()
  @IsNumber()
  @ToDynamicExpiryDays()
  @ValidateIf(dto => dto.hasExpiration && dto.expiryType === EnumExpiryType.DYNAMIC)
  @TransformIf((dto: ProductRequestCreateDto) => dto.hasExpiration === true)
  @ApiProperty({ required: false, example: 7 })
  dynamicExpiryDays: number

  @IsNotEmpty()
  @IsDate()
  @ToStaticExpiryDate({ endOfDay: true })
  @ValidateIf(dto => dto.hasExpiration && dto.expiryType === EnumExpiryType.STATIC)
  @TransformIf((dto: ProductRequestCreateDto) => dto.hasExpiration === true)
  @ApiProperty({ required: false, type: Date })
  staticExpiryDate: Date

  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
  @ApiProperty({ required: false, example: false })
  hasShipment: boolean

  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
  @ApiProperty({ required: false, example: false })
  hasInventory: boolean

  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
  @ApiProperty({ required: false, example: false })
  hasExpiration: boolean

  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
  @ApiProperty({ required: false, example: false })
  hasDuePayment: boolean

  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
  @ApiProperty({ required: false, example: false })
  hasLimitPerson: boolean

  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
  @ApiProperty({ required: false, example: false })
  isPopular: boolean

  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
  @ApiProperty({ required: false, example: false })
  isBestSale: boolean

  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
  @ApiProperty({ required: false, example: false })
  isFlashSale: boolean

  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
  @ApiProperty({ required: false, example: false })
  isComingSoon: boolean

  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
  @ApiProperty({ required: false, example: false })
  isNewArrival: boolean

  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
  @ApiProperty({ required: false, example: false })
  isActive: boolean

  @IsOptional()
  @ApiProperty({ required: false, type: 'string', format: 'binary' })
  thumbnail: string
}
