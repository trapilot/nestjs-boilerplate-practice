import { ApiProperty, IntersectionType, OmitType } from '@nestjs/swagger'
import { EnumAuthAbilityAction, EnumAuthAbilityContext, EnumAuthAbilitySubject } from 'app/enums'
import { Expose, Type } from 'class-transformer'
import { ResponseLocaleDto, ResponseUserBelongDto } from 'lib/nest-web'
import { ToPermissionActions } from '../transforms'

class ResponseDataDetailDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  id: number

  @Type(() => String)
  @Expose()
  context: EnumAuthAbilityContext

  @Type(() => ResponseLocaleDto)
  @Expose()
  title: ResponseLocaleDto

  @Type(() => String)
  @Expose()
  subject: EnumAuthAbilitySubject

  @ToPermissionActions()
  @Expose()
  actions: EnumAuthAbilityAction[]

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
