import { CommandMigrateBase, HelperService } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { Command, Option } from 'nest-commander'

@Command({
  name: 'seed:user-role',
  description: 'Attach admin role with all permissions',
})
export class UserRoleSeed extends CommandMigrateBase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService,
  ) {
    super()
  }

  @Option({
    flags: '-ids, --users [string]',
    description: 'List of members, separator by comma',
  })
  parseIds(val: string): number[] {
    return (val ?? '').split(',').map(s => Number(s))
  }

  async up(): Promise<void> {
    const adminUsers = await this.prisma.user.findMany({
      where: { level: 0 },
      select: { id: true },
    })
    const adminRoles = await this.prisma.role.findMany({
      where: { level: { lte: 1 } },
      include: { pivotPermissions: true },
    })

    for (const adminRole of adminRoles) {
      const roleUsers = await this.prisma.user.findMany({
        where: { pivotRoles: { some: { roleId: adminRole.id } } },
        select: { id: true },
      })

      if (roleUsers.length) {
        const userIds = roleUsers.map(user => user.id)
        await this.prisma.usersRoles.deleteMany({
          where: { roleId: adminRole.id, userId: { in: userIds } },
        })
      }

      const permissions = await this.prisma.permission.findMany({
        select: { id: true, bitwise: true },
      })
      const oldPermissionIds = adminRole.pivotPermissions.map(rp => rp.permissionId)
      const newPermissionIds = permissions.map(p => p.id)

      const diffIds = this.helperService.arrayDifference(oldPermissionIds, newPermissionIds)
      const oldIds = this.helperService.arrayIntersection(oldPermissionIds, newPermissionIds)
      const addIds = this.helperService.arrayIntersection(diffIds, newPermissionIds)
      const delIds = this.helperService.arrayDifference(diffIds, addIds)

      await this.prisma.$transaction(async tx => {
        await tx.rolesPermissions.deleteMany({ where: { permissionId: { in: delIds } } })
        await tx.rolesPermissions.createMany({
          data: addIds.map(permissionId => {
            return {
              permissionId,
              roleId: adminRole.id,
              bitwise: permissions.find(p => p.id === permissionId)?.bitwise ?? 0,
            }
          }),
        })

        const userRoles = []
        const userIds = [...adminUsers, ...roleUsers].map(user => user.id)
        for (const userId of this.helperService.arrayUnique(userIds)) {
          userRoles.push({ userId: userId, roleId: adminRole.id })
        }
        await tx.usersRoles.createMany({
          data: userRoles,
          skipDuplicates: true,
        })
      })

      // update bitwise
      for (const id of oldIds) {
        const bitwise = permissions.find(p => p.id === id)?.bitwise ?? 0
        await this.prisma.rolesPermissions.updateMany({
          data: { bitwise },
          where: { roleId: adminRole.id, permissionId: id },
        })
      }
    }
  }

  async down(): Promise<void> {}
}
