import { Logger } from '@nestjs/common'
import { Prisma } from '@runtime/prisma-client'
import { HelperService, NEST_CLI } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { Command, CommandRunner } from 'nest-commander'
import { ENUM_APP_ABILITY_SUBJECT } from 'shared/enums'
import { UserAbilityUtil } from 'shared/helpers'

@Command({
  name: 'permission:migrate',
  description: 'Migrate permissions',
})
export class PermissionMigrateCommand extends CommandRunner {
  private readonly logger = new Logger(NEST_CLI)

  constructor(
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService,
  ) {
    super()
  }

  async run(): Promise<void> {
    this.logger.warn(`${PermissionMigrateCommand.name} is running...`)

    try {
      const updatedAt = this.helperService.dateCreate()
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
    const contexts = UserAbilityUtil.getContexts()
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
    const _disables = UserAbilityUtil.getDisablePerms()
    const _invisibles = UserAbilityUtil.getInvisiblePerms()

    const permissions: Prisma.PermissionUncheckedCreateInput[] = []

    Object.values(ENUM_APP_ABILITY_SUBJECT).forEach((subject) => {
      const actions = UserAbilityUtil.getSubjectActions(subject)
      permissions.push({
        subject: subject.toString(),
        bitwise: UserAbilityUtil.toBitwise(actions),
        title: UserAbilityUtil.toSubject(subject),
        context: UserAbilityUtil.findContext(subject),
        isActive: !_disables.includes(subject),
        isVisible: !_invisibles.includes(subject),
      })
    })
    return permissions
  }

  async cleanAllPermissions() {
    await this.prisma.$executeRaw`UPDATE permissions SET title = NULL, context = NULL`
  }
}
