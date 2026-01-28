import { Role, User, UserLoginLog, UserSession, UsersRoles } from '@runtime/prisma-client'

export type TUserSession = UserSession
export type TUserLoginLog = UserLoginLog

export type TUsersRoles = UsersRoles & {
  role?: Role
}

export type TUser = User & {
  logs?: TUserLoginLog[]
  sessions?: TUserSession[]
  pivotRoles?: TUsersRoles[]
}

export interface IUserCreatedOptions {
  roleId: number
}

export interface IUserUpdateOptions extends IUserCreatedOptions {
  updatedAt?: Date
}
