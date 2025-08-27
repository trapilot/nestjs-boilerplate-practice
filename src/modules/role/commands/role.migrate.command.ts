import { Logger } from '@nestjs/common'
import { HelperArrayService, NEST_CLI } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { Command, CommandRunner, Option } from 'nest-commander'

@Command({
  name: 'role:migrate',
  description: 'Attach admin role with all permissions',
})
export class RoleMigrateCommand extends CommandRunner {
  private readonly logger = new Logger(NEST_CLI)

  constructor(
    private readonly prisma: PrismaService,
    private readonly helperArrayService: HelperArrayService,
  ) {
    super()
  }

  @Option({
    flags: '-ids, --users [string]',
    description: 'List of members, separator by comma',
  })
  parseIds(val: string): number[] {
    return (val ?? '').split(',').map((s) => Number(s))
  }

  async run(): Promise<void> {
    this.logger.warn(`${RoleMigrateCommand.name} is running...`)

    try {
      const adminRoles = await this.prisma.role.findMany({
        where: { id: { lte: 3 } },
        include: { pivotPermissions: true },
      })

      for (const adminRole of adminRoles) {
        const adminUsers = await this.prisma.user.findMany({
          where: { pivotRoles: { some: { roleId: adminRole.id } } },
        })

        if (adminUsers.length && adminRole) {
          const adminIds = adminUsers.map((admin) => admin.id)
          await this.prisma.usersRoles.deleteMany({
            where: { roleId: adminRole.id, userId: { in: adminIds } },
          })

          const permissions = await this.prisma.permission.findMany({
            select: { id: true, bitwise: true },
          })
          const oldPermissionIds = adminRole.pivotPermissions.map((rp) => rp.permissionId)
          const newPermissionIds = permissions.map((p) => p.id)

          const diffIds = this.helperArrayService.getDifference(oldPermissionIds, newPermissionIds)
          const oldIds = this.helperArrayService.getIntersection(oldPermissionIds, newPermissionIds)
          const addIds = this.helperArrayService.getIntersection(diffIds, newPermissionIds)
          const delIds = this.helperArrayService.getDifference(diffIds, addIds)

          await this.prisma.$transaction(async (tx) => {
            await tx.rolesPermissions.deleteMany({ where: { permissionId: { in: delIds } } })
            await tx.rolesPermissions.createMany({
              data: addIds.map((permissionId) => {
                return {
                  permissionId,
                  roleId: adminRole.id,
                  bitwise: permissions.find((p) => p.id == permissionId)?.bitwise ?? 0,
                }
              }),
            })

            const adminRoles = []
            for (const adminId of adminIds) {
              adminRoles.push({ userId: adminId, roleId: adminRole.id })
            }
            await tx.usersRoles.createMany({
              data: adminRoles,
              skipDuplicates: true,
            })
          })

          // update bitwise
          for (const id of oldIds) {
            const bitwise = permissions.find((p) => p.id == id)?.bitwise ?? 0
            await this.prisma.rolesPermissions.updateMany({
              data: { bitwise },
              where: { roleId: adminRole.id, permissionId: id },
            })
          }
        }
      }
    } catch (err: any) {
      this.logger.error(err)
    }
    return
  }
}
