import { Role, RolesPermissions } from '@prisma/client'
import { TPermission } from 'modules/permission'
import { RolePermissionRequestCreateDto } from '../dtos'

export type TRolePermission = RolesPermissions

export type TRole = Role & {
  pivotPermissions?: TRolePermission[]
  fullPermissions?: TPermission[]
}

export interface IRoleCreateOptions {
  permissions: RolePermissionRequestCreateDto[]
}

export interface IRoleUpdateOptions extends IRoleCreateOptions {}
