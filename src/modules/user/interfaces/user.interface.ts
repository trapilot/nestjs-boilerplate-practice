import { Role, User, UserLoginHistory, UsersRoles, UserTokenHistory } from '@runtime/prisma-client'

export type TUserTokenHistory = UserTokenHistory
export type TUserLoginHistory = UserLoginHistory

export type TUsersRoles = UsersRoles & {
  role?: Role
}

export type TUser = User & {
  tokenHistories?: TUserTokenHistory[]
  loginHistories?: TUserLoginHistory[]
  pivotRoles?: TUsersRoles[]
}

export interface IUserCreatedOptions {
  roleId: number
}

export interface IUserUpdateOptions extends IUserCreatedOptions {}
