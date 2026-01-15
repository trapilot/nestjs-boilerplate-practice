import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { ToDate } from 'lib/nest-core'
import { ResponseUserBelongDto } from 'lib/nest-web'

class ResponseDataDetailDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  id: number

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

export class NotificationHistoryResponseDetailDto extends IntersectionType(
  ResponseDataDetailDto,
  ResponseDataRelationDto
) {}

export class NotificationHistoryResponseListDto extends IntersectionType(
  OmitType(ResponseDataDetailDto, [] as const),
  ResponseDataRelationDto
) {}

export class NotificationHistoryResponseBelongDto extends IntersectionType(
  PickType(ResponseDataDetailDto, ['id'] as const),
  ResponseDataRelationDto
) {}
