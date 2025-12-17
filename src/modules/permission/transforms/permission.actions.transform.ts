import { AppAbilityUtil } from 'app/helpers'
import { Transform } from 'class-transformer'
import { TPermission } from '../interfaces'

export function ToPermissionActions(): (target: any, key: string) => void {
  return Transform(({ obj }: { obj: TPermission }) => {
    return AppAbilityUtil.toActions(obj.bitwise)
  })
}
