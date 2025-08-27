import { faker } from '@faker-js/faker'
import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { ENUM_MEDIA_TYPE } from '@prisma/client'
import { Expose, Type } from 'class-transformer'
import { ToDate, ToUrl } from 'lib/nest-core'
import { ResponseLocaleDto, ResponseUserBelongDto } from 'lib/nest-web'

class ResponseDataDetailDto {
  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @Type(() => Number)
  @Expose()
  id: number

  @ApiProperty({ enum: ENUM_MEDIA_TYPE, example: ENUM_MEDIA_TYPE.BANNER })
  @Type(() => String)
  @Expose()
  type: ENUM_MEDIA_TYPE

  @ApiProperty({ example: faker.image.url() })
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
