import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { ToDate } from 'lib/nest-core'
import { ResponseUserBelongDto } from 'lib/nest-web'

class ResponseDataDetailDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  id: number

  @ApiProperty({
    required: true,
    description: 'Country name',
    maxLength: 100,
    minLength: 1,
  })
  @Type(() => String)
  @Expose()
  name: string

  @ApiProperty({
    required: true,
    description: 'Country code, Alpha 2 code version',
    maxLength: 2,
    minLength: 2,
  })
  @Type(() => String)
  @Expose()
  alpha2Code: string

  @ApiProperty({
    required: true,
    description: 'Country code, Alpha 3 code version',
    maxLength: 3,
    minLength: 3,
  })
  @Type(() => String)
  @Expose()
  alpha3Code: string

  @ApiProperty({
    required: true,
    description: 'Country phone code',
    maxLength: 4,
    minLength: 4,
    isArray: true,
  })
  @Type(() => String)
  @Expose()
  phoneCode: string[]

  @ApiProperty({ required: true })
  @Type(() => String)
  @Expose()
  continent: string

  @ApiProperty({ required: true })
  @Type(() => String)
  @Expose()
  timezone: string

  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @Expose()
  isActive: boolean

  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @Expose()
  isVisible: boolean

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

export class CountryResponseDetailDto extends IntersectionType(
  ResponseDataDetailDto,
  ResponseDataRelationDto,
) {}

export class CountryResponseListDto extends IntersectionType(
  OmitType(ResponseDataDetailDto, [] as const),
  ResponseDataRelationDto,
) {}

export class CountryResponseBelongDto extends IntersectionType(
  PickType(ResponseDataDetailDto, ['id'] as const),
  ResponseDataRelationDto,
) {}
