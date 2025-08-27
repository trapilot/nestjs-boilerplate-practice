import { faker } from '@faker-js/faker'
import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { ToDate, ToUrl } from 'lib/nest-core'
import { ResponseLocaleDto, ResponseUserBelongDto } from 'lib/nest-web'

class ResponseDataDetailDto {
  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
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

  @ApiProperty({ example: faker.date.past() })
  @ToDate()
  @Expose()
  createdAt: Date

  @ApiProperty({ example: faker.date.recent() })
  @ToDate()
  @Expose()
  updatedAt: Date
}

class ResponseDataRelationDto extends ResponseUserBelongDto {}

export class ProductBrandResponseDetailDto extends IntersectionType(
  ResponseDataDetailDto,
  ResponseDataRelationDto,
) {}

export class ProductBrandResponseListDto extends IntersectionType(
  OmitType(ResponseDataDetailDto, [] as const),
  ResponseDataRelationDto,
) {}

export class ProductBrandResponseBelongDto extends IntersectionType(
  PickType(ResponseDataDetailDto, ['id', 'name', 'isActive'] as const),
  ResponseDataRelationDto,
) {}
