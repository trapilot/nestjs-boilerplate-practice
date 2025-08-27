import { ApiProperty, IntersectionType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { ENUM_DATE_FORMAT, ToDate } from 'lib/nest-core'
import { UserResponseBelongDto } from './user.response.detail.dto'

class ResponseUserLoginHistoryDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  id: number

  @ToDate({ format: ENUM_DATE_FORMAT.DATE, ref: 'loginDate' })
  @Expose()
  date: Date | null

  @ToDate({ format: ENUM_DATE_FORMAT.DURATION_SHORT, ref: 'loginDate' })
  @Expose()
  time: Date | null
}

class ResponseUserRelationDto {
  @Type(() => UserResponseBelongDto)
  @Expose()
  user: UserResponseBelongDto
}

export class UserResponseLoginHistoryDto extends IntersectionType(
  ResponseUserLoginHistoryDto,
  ResponseUserRelationDto,
) {}
