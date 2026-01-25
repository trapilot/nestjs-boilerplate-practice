import { IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IAuthPayloadPermission } from 'lib/nest-auth'
import { ToUserPayloadPermissions, ToUserPayloadRoles } from '../transforms'
import { UserProfileResponseDto } from './user.response.profile.dto'

export class ResponseUserPayloadDto extends PickType(UserProfileResponseDto, [
  'id',
  'email',
  'phone',
  'loginDate',
] as const) {}

class ResponseUserPayloadRelationDto {
  @Type(() => Number)
  @Expose()
  level: number

  @ToUserPayloadRoles()
  @Expose()
  roles: number[]

  @ToUserPayloadPermissions()
  @Expose()
  permissions: IAuthPayloadPermission[]
}

export class UserResponsePayloadDto extends IntersectionType(
  ResponseUserPayloadDto,
  ResponseUserPayloadRelationDto,
) {}
