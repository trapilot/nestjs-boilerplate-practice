import { IUserDataRole, IUserTransformData } from '../interfaces'

export class UserTransformUtil {
  static toValidUserRoles(user: IUserTransformData): IUserDataRole[] {
    return (user?.pivotRoles ?? [])
      .map((roles) => roles.role)
      .filter((role) => role.isActive && role.level >= user.level)
  }

  static toValidUserRoleIds(user: IUserTransformData): number[] {
    return this.toValidUserRoles(user).map((role) => role.id)
  }
}
