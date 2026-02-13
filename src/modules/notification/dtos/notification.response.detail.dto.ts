import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import {
  EnumNotificationChannel,
  EnumNotificationMethod,
  EnumPushStatus,
  EnumPushType,
} from '@runtime/prisma-client'
import { Expose, Type } from 'class-transformer'
import { EnumDateFormat, ToDate, ToNestedArray } from 'lib/nest-core'
import { ResponseLocaleDto, ResponseUserBelongDto } from 'lib/nest-web'
import { EnumNotificationRefType } from '../enums/notification.enum'

class ResponsePushDetailDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  id: number

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  notificationId: number

  @ApiProperty({ example: EnumPushType.DAILY })
  @Type(() => String)
  @Expose()
  type: string

  @ApiProperty({ example: EnumPushStatus.COMPLETED })
  @Type(() => String)
  @Expose()
  status: string

  @ApiProperty({ example: '08:30' })
  @ToDate({ format: EnumDateFormat.DURATION_SHORT })
  @Expose()
  executeTime: string

  @ApiProperty({ example: new Date(Date.now() - 30000 * 3600) })
  @ToDate({ format: EnumDateFormat.DB_DATE })
  @Expose()
  executeDate: string

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  weekday: number

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  day: number

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  month: number

  @ApiProperty({ example: new Date(Date.now() - 30000 * 3600) })
  @ToDate({ format: EnumDateFormat.DATE })
  @Expose()
  startDate: Date

  @ApiProperty({ example: new Date(Date.now() - 30000 * 3600) })
  @ToDate({ format: EnumDateFormat.DATE })
  @Expose()
  untilDate: Date

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

class ResponseDataDetailDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  id: number

  @ApiProperty({ example: EnumNotificationChannel.SMS })
  @Type(() => String)
  @Expose()
  channel: string

  @ApiProperty({ example: EnumNotificationMethod.TEXT })
  @Type(() => String)
  @Expose()
  type: string

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  refId: number

  @ApiProperty({ example: EnumNotificationRefType.TEXT })
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

  @ApiProperty({ example: new Date(Date.now() - 30000 * 3600) })
  @ToDate()
  @Expose()
  createdAt: Date

  @ApiProperty({ example: new Date(Date.now() - 1000 * 3600) })
  @ToDate()
  @Expose()
  updatedAt: Date
}

class ResponseGroupRelationDto {
  @ApiProperty({ example: 1 })
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

  @ApiProperty({ example: new Date(Date.now() - 30000 * 3600) })
  @Type(() => Date)
  @Expose()
  joinSinceDate: Date[]

  @ApiProperty({ example: new Date(Date.now() + 30000 * 3600) })
  @Type(() => Date)
  @Expose()
  joinUntilDate: Date[]
}

class ResponseDataRelationDto extends ResponseUserBelongDto {
  @ApiProperty({ type: () => ResponsePushDetailDto })
  @Type(() => ResponsePushDetailDto)
  @Expose()
  pushes: ResponsePushDetailDto[]

  @ApiProperty({ type: () => ResponseGroupRelationDto })
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
