import { Logger } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { AuthAbilityHelper, ENUM_AUTH_ABILITY_SUBJECT } from 'lib/nest-auth'
import { HelperDateService, NEST_CLI } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { Command, CommandRunner } from 'nest-commander'

@Command({
  name: 'permission:seed',
  description: 'Seed permissions',
})
export class PermissionSeedCommand extends CommandRunner {
  private readonly logger = new Logger(NEST_CLI)

  constructor(
    private readonly prisma: PrismaService,
    private readonly helperDateService: HelperDateService,
  ) {
    super()
  }

  async run(): Promise<void> {
    this.logger.warn(`${PermissionSeedCommand.name} is running...`)

    try {
      const updatedAt = this.helperDateService.create()
      const permissions = this.getAllPermissions()

      await this.cleanAllPermissions()

      for (const permission of permissions) {
        const sorting = this.getSorting(permission)

        await this.prisma.permission.upsert({
          where: { subject: permission.subject },
          update: { ...permission, sorting, updatedAt },
          create: { ...permission, sorting, updatedAt },
        })
      }

      await this.prisma.$transaction(async (tx) => {
        const removes = await tx.permission.findMany({
          where: { updatedAt: { lt: updatedAt } },
        })
        const permissionIds = removes.map((p) => p.id)
        await tx.rolesPermissions.deleteMany({
          where: { permissionId: { in: permissionIds } },
        })
        await tx.permission.deleteMany({
          where: { id: { in: permissionIds } },
        })
      })
    } catch (err: any) {
      throw err
    }
    return
  }

  getSorting(permission: Prisma.PermissionUncheckedCreateInput): number {
    let sorting = 10
    const contexts = AuthAbilityHelper.getContexts()
    for (const context in contexts) {
      const subjects = contexts[context].subjects
      if (subjects.includes(permission.subject)) {
        const index = subjects.indexOf(permission.subject)
        return sorting + index
      }
      sorting += 10
    }
    return sorting
  }

  getAllPermissions() {
    const _disables = AuthAbilityHelper.getDisablePerms()
    const _invisibles = AuthAbilityHelper.getInvisiblePerms()

    const permissions: Prisma.PermissionUncheckedCreateInput[] = []

    Object.values(ENUM_AUTH_ABILITY_SUBJECT).forEach((subject) => {
      const actions = AuthAbilityHelper.getSubjectActions(subject)
      const permission = AuthAbilityHelper.toPermission<Prisma.PermissionUncheckedCreateInput>(
        subject,
        actions,
        _disables,
        _invisibles,
      )

      permissions.push(permission)
    })
    return permissions
  }

  async cleanAllPermissions() {
    await this.prisma.$executeRaw`UPDATE permissions SET title = NULL, context = NULL`
  }
}
