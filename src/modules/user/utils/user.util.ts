import { IUserDataRole, IUserTransformData } from '../interfaces'

export class UserUtil {
  static parseRoles(user: IUserTransformData): IUserDataRole[] {
    return (user?.pivotRoles ?? [])
      .map((roles) => roles.role)
      .filter((role) => role.isActive && role.level >= user.level)
  }

  static parseRoleIds(user: IUserTransformData): number[] {
    return this.parseRoles(user).map((role) => role.id)
  }
}
