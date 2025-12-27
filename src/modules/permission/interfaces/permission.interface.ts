import { Permission, RolesPermissions } from '@runtime/prisma-client'

export type TRolePermission = RolesPermissions

export type TPermission = Permission & {
  pivotRoles?: TRolePermission[]
}
