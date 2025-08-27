import { faker } from '@faker-js/faker'
import { ApiProperty, IntersectionType, OmitType } from '@nestjs/swagger'
import { ENUM_PUSH_STATUS, ENUM_PUSH_TYPE } from '@prisma/client'
import { Exclude, Expose, Type } from 'class-transformer'
import { ENUM_DATE_FORMAT, ToDate, ToDuration } from 'lib/nest-core'
import { ResponseUserBelongDto } from 'lib/nest-web'
import { NotificationResponseBelongDto } from 'src/modules/notification/dtos'

class ResponseDataDetailDto {
  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @Type(() => Number)
  @Expose()
  id: number

  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @Type(() => Number)
  @Expose()
  notificationId: number

  @ApiProperty({ example: ENUM_PUSH_TYPE.DAILY })
  @Type(() => String)
  @Expose()
  type: string

  @ApiProperty({ example: ENUM_PUSH_STATUS.COMPLETED })
  @Type(() => String)
  @Expose()
  status: string

  @ApiProperty({ example: faker.date.past() })
  @ToDuration({ parts: 2 })
  @Expose()
  executeTime: string

  @ApiProperty({ example: faker.date.past() })
  @ToDate({ format: ENUM_DATE_FORMAT.DB_DATE })
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

  @ApiProperty({ example: faker.date.past() })
  @ToDate({ format: ENUM_DATE_FORMAT.DATE })
  @Expose()
  startDate: Date

  @ApiProperty({ example: faker.date.past() })
  @ToDate({ format: ENUM_DATE_FORMAT.DATE })
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

  @ApiProperty({ example: faker.date.future() })
  @Type(() => Date)
  // @Expose()
  @Exclude()
  expiresAt: Date

  @ApiProperty({ example: faker.date.future() })
  @Type(() => Date)
  // @Expose()
  @Exclude()
  scheduledAt: Date

  @ApiProperty({ example: faker.date.past() })
  @ToDate()
  @Expose()
  createdAt: Date

  @ApiProperty({ example: faker.date.recent() })
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
  ResponseDataRelationDto,
) {}

export class PushResponseListDto extends IntersectionType(
  OmitType(ResponseDataDetailDto, [] as const),
  ResponseDataRelationDto,
) {}

export class PushResponseBelongDto extends IntersectionType(
  OmitType(ResponseDataDetailDto, [] as const),
  ResponseDataRelationDto,
) {}
