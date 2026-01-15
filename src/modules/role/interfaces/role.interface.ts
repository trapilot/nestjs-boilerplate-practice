import { Role, RolesPermissions } from '@runtime/prisma-client'
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

export interface IRoleUpdateOptions extends IRoleCreateOptions {
  updatedAt?: Date
}

export interface IRoleResponseTransform {
  title: string
  context: string
  subject: string
  actions: {
    [key: string]: boolean
  }[]
}
