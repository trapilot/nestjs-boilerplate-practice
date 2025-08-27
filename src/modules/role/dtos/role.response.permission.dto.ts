import { Expose, Type } from 'class-transformer'
import { ENUM_AUTH_ABILITY_ACTION, ENUM_AUTH_ABILITY_SUBJECT } from 'lib/nest-auth'

export class RolePermissionResponseDto {
  @Type(() => Number)
  @Expose()
  id: number

  @Type(() => String)
  @Expose()
  title: string

  @Type(() => String)
  @Expose()
  subject: ENUM_AUTH_ABILITY_SUBJECT

  @Expose()
  action: ENUM_AUTH_ABILITY_ACTION

  @Expose()
  actions: ENUM_AUTH_ABILITY_ACTION[]
}
