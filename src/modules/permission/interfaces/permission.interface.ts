import { Permission, RolesPermissions } from '@prisma/client'
import { ENUM_APP_ABILITY_ACTION } from 'app/enums'

export type TRolePermission = RolesPermissions

export type TPermission = Permission & {
  pivotRoles?: TRolePermission[]
}

export interface IPermissionCreateOptions {
  actions: ENUM_APP_ABILITY_ACTION[]
  createdBy?: number
}

export interface IPermissionUpdateOptions extends Omit<IPermissionCreateOptions, 'createdBy'> {
  updatedBy?: number
}
