import { ApiProperty, IntersectionType, OmitType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { ENUM_AUTH_ABILITY_ACTION, ENUM_AUTH_ABILITY_SUBJECT } from 'lib/nest-auth'
import { ResponseUserBelongDto } from 'lib/nest-web'
import { ToPermissionActions } from '../transforms'

class ResponseDataDetailDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  id: number

  @Type(() => String)
  @Expose()
  title: string

  @Type(() => String)
  @Expose()
  description?: string

  @Type(() => String)
  @Expose()
  subject: ENUM_AUTH_ABILITY_SUBJECT

  @ToPermissionActions()
  @Expose()
  actions: ENUM_AUTH_ABILITY_ACTION[]

  @Type(() => Boolean)
  @Expose()
  isVisible: boolean

  @Type(() => Boolean)
  @Expose()
  isActive: boolean

  @Type(() => Date)
  @Expose()
  createdAt: Date

  @Type(() => Date)
  @Expose()
  updatedAt: Date
}

export class PermissionResponseDetailDto extends IntersectionType(
  ResponseDataDetailDto,
  ResponseUserBelongDto,
) {}

export class PermissionResponseListDto extends IntersectionType(
  OmitType(ResponseDataDetailDto, [] as const),
  ResponseUserBelongDto,
) {}
