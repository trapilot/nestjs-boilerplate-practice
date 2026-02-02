import { EnumAuthAbilityAction, EnumAuthAbilitySubject } from 'app/enums/user.enum'
import { Expose, Type } from 'class-transformer'

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
