import { IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IAuthJwtPermission, ToAuthUserPermissions, ToAuthUserRoles } from 'lib/nest-auth'
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

  @ToAuthUserRoles()
  @Expose()
  roles: number[]

  @ToAuthUserPermissions()
  @Expose()
  permissions: IAuthJwtPermission[]
}

export class UserResponsePayloadDto extends IntersectionType(
  ResponseUserPayloadDto,
  ResponseUserPayloadRelationDto,
) {}
