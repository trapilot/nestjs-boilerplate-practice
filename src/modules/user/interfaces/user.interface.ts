import { Role, User, UserSession, UserTwoFactor, UsersRoles } from '@runtime/prisma-client'

export type TUsersRoles = UsersRoles & {
  role?: Role
}

export type TUser = User & {
  twoFactor?: UserTwoFactor
  sessions?: UserSession[]
  pivotRoles?: TUsersRoles[]
}

export interface IUserCreatedOptions {
  roleId: number
}

export interface IUserUpdateOptions extends IUserCreatedOptions {
  updatedAt?: Date
}
