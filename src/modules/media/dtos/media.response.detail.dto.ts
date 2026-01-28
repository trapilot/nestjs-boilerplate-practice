import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { EnumMediaType } from '@runtime/prisma-client'
import { Expose, Type } from 'class-transformer'
import { ToDate, ToUrl } from 'lib/nest-core'
import { ResponseLocaleDto, ResponseUserBelongDto } from 'lib/nest-web'

class ResponseDataDetailDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  id: number

  @ApiProperty({ enum: EnumMediaType, enumName: 'EnumMediaType', example: EnumMediaType.BANNER })
  @Type(() => String)
  @Expose()
  type: EnumMediaType

  @ApiProperty({ example: '' })
  @ToUrl()
  @Expose()
  url: string

  @ApiProperty({ example: '' })
  @Type(() => String)
  @Expose()
  mime: string

  @ApiProperty({ type: ResponseLocaleDto })
  @Type(() => ResponseLocaleDto)
  @Expose()
  title: ResponseLocaleDto

  @ApiProperty({ type: ResponseLocaleDto })
  @Type(() => ResponseLocaleDto)
  @Expose()
  brief: ResponseLocaleDto

  @ApiProperty({ example: '' })
  @Type(() => String)
  @Expose()
  refType: string

  @ApiProperty({ example: '' })
  @Type(() => String)
  @Expose()
  refValue: string

  @ApiProperty({ example: 0 })
  @Type(() => Number)
  @Expose()
  sorting: number

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

export class MediaResponseDetailDto extends IntersectionType(
  ResponseDataDetailDto,
  ResponseDataRelationDto,
) {}

export class MediaResponseListDto extends IntersectionType(
  OmitType(ResponseDataDetailDto, [] as const),
  ResponseDataRelationDto,
) {}

export class MediaResponseBelongDto extends IntersectionType(
  PickType(ResponseDataDetailDto, ['id'] as const),
  ResponseDataRelationDto,
) {}
