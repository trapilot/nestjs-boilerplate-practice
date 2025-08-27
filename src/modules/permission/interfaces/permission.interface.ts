import { Permission, RolesPermissions } from '@prisma/client'
import { ENUM_AUTH_ABILITY_ACTION } from 'lib/nest-auth'

export type TRolePermission = RolesPermissions

export type TPermission = Permission & {
  pivotRoles?: TRolePermission[]
}

export interface IPermissionCreateOptions {
  actions: ENUM_AUTH_ABILITY_ACTION[]
  createdBy?: number
}

export interface IPermissionUpdateOptions extends Omit<IPermissionCreateOptions, 'createdBy'> {
  updatedBy?: number
}
