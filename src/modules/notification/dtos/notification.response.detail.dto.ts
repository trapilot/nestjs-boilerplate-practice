import { faker } from '@faker-js/faker'
import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { ENUM_NOTIFICATION_CHANNEL, ENUM_NOTIFICATION_TYPE } from '@prisma/client'
import { Expose, Type } from 'class-transformer'
import { ToDate, ToNestedArray } from 'lib/nest-core'
import { ResponseLocaleDto, ResponseUserBelongDto } from 'lib/nest-web'
import { PushResponseBelongDto } from 'src/modules/push/dtos'
import { ENUM_NOTIFICATION_REF_TYPE } from '../enums'

class ResponseDataDetailDto {
  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @Type(() => Number)
  @Expose()
  id: number

  @ApiProperty({ example: ENUM_NOTIFICATION_CHANNEL.SMS })
  @Type(() => String)
  @Expose()
  channel: string

  @ApiProperty({ example: ENUM_NOTIFICATION_TYPE.TEXT })
  @Type(() => String)
  @Expose()
  type: string

  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @Type(() => Number)
  @Expose()
  refId: number

  @ApiProperty({ example: ENUM_NOTIFICATION_REF_TYPE.TEXT })
  @Type(() => String)
  @Expose()
  refType: string

  @ApiProperty({ type: ResponseLocaleDto })
  @Type(() => ResponseLocaleDto)
  @Expose()
  title: ResponseLocaleDto

  @ApiProperty({ type: ResponseLocaleDto })
  @Type(() => ResponseLocaleDto)
  @Expose()
  description: ResponseLocaleDto

  @ApiProperty({ type: ResponseLocaleDto })
  @Type(() => ResponseLocaleDto)
  @Expose()
  content: ResponseLocaleDto

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

class ResponseGroupRelationDto {
  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @Type(() => Number)
  @Expose()
  id: number

  @ApiProperty({ type: ResponseLocaleDto })
  @Type(() => ResponseLocaleDto)
  @Expose()
  title: ResponseLocaleDto

  @ApiProperty({ example: [] })
  @Type(() => Number)
  @Expose()
  tierIds: number[]

  @ApiProperty({ example: [] })
  @Type(() => String)
  @Expose()
  emails: string[]

  @ApiProperty({ example: [] })
  @Type(() => String)
  @Expose()
  phones: string[]

  @ApiProperty({ example: faker.date.past() })
  @Type(() => Date)
  @Expose()
  joinSinceDate: Date[]

  @ApiProperty({ example: faker.date.past() })
  @Type(() => Date)
  @Expose()
  joinUntilDate: Date[]
}

class ResponseDataRelationDto extends ResponseUserBelongDto {
  @ApiProperty({ type: [PushResponseBelongDto] })
  @Type(() => PushResponseBelongDto)
  @Expose()
  pushes: PushResponseBelongDto[]

  @ApiProperty({ type: [ResponseGroupRelationDto] })
  @ToNestedArray<ResponseGroupRelationDto>({
    path: 'pivotGroups.group',
    type: ResponseGroupRelationDto,
    default: [],
  })
  @Expose()
  groups: ResponseGroupRelationDto[]
}

export class NotificationResponseDetailDto extends IntersectionType(
  ResponseDataDetailDto,
  ResponseDataRelationDto,
) {}

export class NotificationResponseListDto extends IntersectionType(
  OmitType(ResponseDataDetailDto, [] as const),
  ResponseDataRelationDto,
) {}

export class NotificationResponseBelongDto extends IntersectionType(
  PickType(ResponseDataDetailDto, ['id'] as const),
  ResponseDataRelationDto,
) {}
