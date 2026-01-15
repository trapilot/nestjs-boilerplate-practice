import { Expose, Type } from 'class-transformer'
import { EnumAuthAbilityAction, EnumAuthAbilitySubject } from 'shared/enums'

export class RolePermissionResponseDto {
  @Type(() => Number)
  @Expose()
  id: number

  @Type(() => String)
  @Expose()
  title: string

  @Type(() => String)
  @Expose()
  subject: EnumAuthAbilitySubject

  @Expose()
  action: EnumAuthAbilityAction

  @Expose()
  actions: EnumAuthAbilityAction[]
}
