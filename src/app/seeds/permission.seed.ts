import { UserAbilityUtil } from 'app/helpers/user.ability.util'
import { CommandMigrateBase, HelperService } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { Command } from 'nest-commander'

@Command({
  name: 'seed:permission',
  description: 'Seed permissions',
})
export class PermissionSeed extends CommandMigrateBase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService,
  ) {
    super()
  }

  async up(): Promise<void> {
    const updatedAt = this.helperService.dateNow()
    const permissions = UserAbilityUtil.getFullPermData()

    await this.prisma.$executeRaw`UPDATE permissions SET title = NULL, context = NULL`

    for (const permission of permissions) {
      const sorting = UserAbilityUtil.getSubjectOrder(permission.subject)

      await this.prisma.permission.upsert({
        where: { subject: permission.subject },
        update: { ...permission, sorting, updatedAt },
        create: { ...permission, sorting, updatedAt },
      })
    }

    await this.prisma.$transaction(async tx => {
      const removes = await tx.permission.findMany({
        where: { updatedAt: { lt: updatedAt } },
      })
      const permissionIds = removes.map(p => p.id)
      await tx.rolesPermissions.deleteMany({
        where: { permissionId: { in: permissionIds } },
      })
      await tx.permission.deleteMany({
        where: { id: { in: permissionIds } },
      })
    })
  }

  async down(): Promise<void> {}
}
