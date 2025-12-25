import { ApiProperty, IntersectionType, OmitType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { ResponseLocaleDto, ResponseUserBelongDto } from 'lib/nest-web'
import {
  ENUM_APP_ABILITY_ACTION,
  ENUM_APP_ABILITY_CONTEXT,
  ENUM_APP_ABILITY_SUBJECT,
} from 'shared/enums'
import { ToPermissionActions } from '../transforms'

class ResponseDataDetailDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  id: number

  @Type(() => String)
  @Expose()
  context: ENUM_APP_ABILITY_CONTEXT

  @Type(() => ResponseLocaleDto)
  @Expose()
  title: ResponseLocaleDto

  @Type(() => String)
  @Expose()
  subject: ENUM_APP_ABILITY_SUBJECT

  @ToPermissionActions()
  @Expose()
  actions: ENUM_APP_ABILITY_ACTION[]

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
