import { Prisma } from '@runtime/prisma-client'
import { EnumScopeType, HelperService, LoggerService, OnScope } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { Command, CommandRunner } from 'nest-commander'
import { EnumAuthAbilitySubject } from 'shared/enums'
import { UserAbilityUtil } from 'shared/helpers'

@Command({
  name: 'permission:migrate',
  description: 'Migrate permissions',
})
export class PermissionMigrateCommand extends CommandRunner {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly helperService: HelperService
  ) {
    super()
  }

  @OnScope(EnumScopeType.COMMAND, { context: 'seed', async: true })
  async run(_passedParam: string[], _options?: Record<string, string | number>): Promise<void> {
    this.logger.log(`${PermissionMigrateCommand.name} is running...`)

    try {
      await this.migrate()
    } catch (err: unknown) {
      this.logger.error(err)
    } finally {
      this.logger.log(`${PermissionMigrateCommand.name} stoped`)
    }
    return
  }

  async migrate(): Promise<boolean> {
    const updatedAt = this.helperService.dateNow()
    const permissions = this.getAllPermissions()

    await this.prisma.$executeRaw`UPDATE permissions SET title = NULL, context = NULL`

    for (const permission of permissions) {
      const sorting = this.getSorting(permission)

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
    return true
  }

  private getSorting(permission: Prisma.PermissionUncheckedCreateInput): number {
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

  private getAllPermissions(): Prisma.PermissionUncheckedCreateInput[] {
    const _disables = UserAbilityUtil.getDisablePerms()
    const _invisibles = UserAbilityUtil.getInvisiblePerms()

    const permissions: Prisma.PermissionUncheckedCreateInput[] = []

    Object.values(EnumAuthAbilitySubject).forEach(subject => {
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
}
