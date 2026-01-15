import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { ToDate, ToUrl } from 'lib/nest-core'
import { ResponseLocaleDto, ResponseUserBelongDto } from 'lib/nest-web'

class ResponseDataDetailDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  id: number

  @ApiProperty({ type: ResponseLocaleDto })
  @Type(() => ResponseLocaleDto)
  @Expose()
  name: ResponseLocaleDto

  @ApiProperty({ example: '' })
  @ToUrl()
  @Expose()
  thumbnail: string

  @ApiProperty({ example: '' })
  @Type(() => String)
  @Expose()
  address: string

  @ApiProperty({ example: 0 })
  @Type(() => Number)
  @Expose()
  latitude: number

  @ApiProperty({ example: 0 })
  @Type(() => Number)
  @Expose()
  longitude: string

  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @Expose()
  isActive: boolean

  @ApiProperty({ example: new Date(Date.now() - 30000 * 3600) })
  @ToDate()
  @Expose()
  createdAt: Date

  @ApiProperty({ example: new Date(Date.now() - 1000 * 3600) })
  @ToDate()
  @Expose()
  updatedAt: Date
}

class ResponseDataRelationDto extends ResponseUserBelongDto {}

export class ProductBrandResponseDetailDto extends IntersectionType(
  ResponseDataDetailDto,
  ResponseDataRelationDto
) {}

export class ProductBrandResponseListDto extends IntersectionType(
  OmitType(ResponseDataDetailDto, [] as const),
  ResponseDataRelationDto
) {}

export class ProductBrandResponseBelongDto extends IntersectionType(
  PickType(ResponseDataDetailDto, ['id', 'name', 'isActive'] as const),
  ResponseDataRelationDto
) {}
