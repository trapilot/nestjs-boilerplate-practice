import { Expose, Type } from 'class-transformer'
import { ENUM_APP_ABILITY_ACTION, ENUM_APP_ABILITY_SUBJECT } from 'shared/enums'

export class RolePermissionResponseDto {
  @Type(() => Number)
  @Expose()
  id: number

  @Type(() => String)
  @Expose()
  title: string

  @Type(() => String)
  @Expose()
  subject: ENUM_APP_ABILITY_SUBJECT

  @Expose()
  action: ENUM_APP_ABILITY_ACTION

  @Expose()
  actions: ENUM_APP_ABILITY_ACTION[]
}
