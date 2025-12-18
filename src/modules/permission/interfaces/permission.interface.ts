import { Permission, RolesPermissions } from '@prisma/client'

export type TRolePermission = RolesPermissions

export type TPermission = Permission & {
  pivotRoles?: TRolePermission[]
}
