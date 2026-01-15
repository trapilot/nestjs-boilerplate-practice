import { Transform } from 'class-transformer'
import { UserAbilityUtil } from 'shared/helpers'
import { TPermission } from '../interfaces'

export function ToPermissionActions(): (target: object, key: string) => void {
  return Transform(({ obj }: { obj: TPermission }) => {
    return UserAbilityUtil.toActions(obj.bitwise)
  })
}
