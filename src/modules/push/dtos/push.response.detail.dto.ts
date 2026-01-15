import { ApiProperty, IntersectionType, OmitType } from '@nestjs/swagger'
import { EnumPushStatus, EnumPushType } from '@runtime/prisma-client'
import { Exclude, Expose, Type } from 'class-transformer'
import { EnumDateFormat, ToDate, ToDuration } from 'lib/nest-core'
import { ResponseUserBelongDto } from 'lib/nest-web'
import { NotificationResponseBelongDto } from 'modules/notification'

class ResponseDataDetailDto {
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
  @ToDuration({ parts: 2 })
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

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  // @Expose()
  @Exclude()
  retries: number

  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @Expose()
  isActive: boolean

  @ApiProperty({ example: new Date(Date.now() + 30000 * 3600) })
  @Type(() => Date)
  // @Expose()
  @Exclude()
  expiresAt: Date

  @ApiProperty({ example: new Date(Date.now() + 30000 * 3600) })
  @Type(() => Date)
  // @Expose()
  @Exclude()
  scheduledAt: Date

  @ApiProperty({ example: new Date(Date.now() - 30000 * 3600) })
  @ToDate()
  @Expose()
  createdAt: Date

  @ApiProperty({ example: new Date(Date.now() - 1000 * 3600) })
  @ToDate()
  @Expose()
  updatedAt: Date
}

class ResponseDataRelationDto extends ResponseUserBelongDto {
  @ApiProperty({ type: NotificationResponseBelongDto })
  @Type(() => NotificationResponseBelongDto)
  @Expose()
  notification: NotificationResponseBelongDto
}

export class PushResponseDetailDto extends IntersectionType(
  ResponseDataDetailDto,
  ResponseDataRelationDto
) {}

export class PushResponseListDto extends IntersectionType(
  OmitType(ResponseDataDetailDto, [] as const),
  ResponseDataRelationDto
) {}

export class PushResponseBelongDto extends IntersectionType(
  OmitType(ResponseDataDetailDto, [] as const),
  ResponseDataRelationDto
) {}
