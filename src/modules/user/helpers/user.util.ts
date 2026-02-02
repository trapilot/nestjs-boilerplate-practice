import { EnumAuthLoginType } from 'lib/nest-auth'
import { EnumUserActivityAction } from '../enums/user.enum'
import { IUserDataRole, IUserTransformData } from '../interfaces/user.auth.interface'

export class UserUtil {
  static parseRoles(user: IUserTransformData): IUserDataRole[] {
    return (user?.pivotRoles ?? [])
      .map(roles => roles.role)
      .filter(role => role.isActive && role.level >= user.level)
  }

  static parseRoleIds(user: IUserTransformData): number[] {
    return this.parseRoles(user).map(role => role.id)
  }

  static getActivityLogin(loginType: EnumAuthLoginType): EnumUserActivityAction {
    let action: EnumUserActivityAction = undefined
    switch (loginType) {
      case EnumAuthLoginType.CREDENTIAL:
        action = EnumUserActivityAction.USER_LOGIN_CREDENTIAL
        break
    }
    return action
  }
}
