import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { EnumNotificationChannel, EnumNotificationMethod } from '@runtime/prisma-client'
import { Expose, Type } from 'class-transformer'
import { EnumMessageRefType, ToDate, ToNestedArray } from 'lib/nest-core'
import { ResponseLocaleDto, ResponseUserBelongDto } from 'lib/nest-web'
import { PushResponseBelongDto } from 'modules/push'

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

  @ApiProperty({ example: EnumMessageRefType.TEXT })
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
  ResponseDataRelationDto
) {}

export class NotificationResponseListDto extends IntersectionType(
  OmitType(ResponseDataDetailDto, [] as const),
  ResponseDataRelationDto
) {}

export class NotificationResponseBelongDto extends IntersectionType(
  PickType(ResponseDataDetailDto, ['id'] as const),
  ResponseDataRelationDto
) {}
