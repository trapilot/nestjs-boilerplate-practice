import { Transform } from 'class-transformer'
import { UserAbilityUtil } from 'shared/helpers'
import { TPermission } from '../interfaces'

export function ToPermissionActions(): (target: any, key: string) => void {
  return Transform(({ obj }: { obj: TPermission }) => {
    return UserAbilityUtil.toActions(obj.bitwise)
  })
}
