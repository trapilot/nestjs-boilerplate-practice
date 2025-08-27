import { Transform } from 'class-transformer'
import { AuthAbilityHelper } from 'lib/nest-auth'
import { TPermission } from '../interfaces'

export function ToPermissionActions(): (target: any, key: string) => void {
  return Transform(({ obj }: { obj: TPermission }) => {
    return AuthAbilityHelper.toActions(obj.bitwise)
  })
}
