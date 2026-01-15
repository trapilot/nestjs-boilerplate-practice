import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { ToDate } from 'lib/nest-core'
import { ResponseLocaleDto, ResponseUserBelongDto } from 'lib/nest-web'

class ResponseDataDetailDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  id: number

  @ApiProperty({ example: '' })
  @Type(() => String)
  @Expose()
  flag: string

  @ApiProperty({ type: ResponseLocaleDto })
  @Type(() => ResponseLocaleDto)
  @Expose()
  name: ResponseLocaleDto

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
  ResponseDataRelationDto
) {}

export class CountryResponseListDto extends IntersectionType(
  OmitType(ResponseDataDetailDto, [] as const),
  ResponseDataRelationDto
) {}

export class CountryResponseBelongDto extends IntersectionType(
  PickType(ResponseDataDetailDto, ['id'] as const),
  ResponseDataRelationDto
) {}
