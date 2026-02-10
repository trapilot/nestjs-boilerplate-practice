import { CommandMigrateBase } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { Command } from 'nest-commander'

@Command({
  name: 'seed:role',
  description: 'Seed roles',
})
export class RoleSeed extends CommandMigrateBase {
  constructor(private readonly prisma: PrismaService) {
    super()
  }

  async up(): Promise<void> {
    let roleId = 1
    for (const code in this.userRoles) {
      const { level, title, description } = this.userRoles[code]

      await this.prisma.role.upsert({
        where: { id: roleId },
        update: { level, isActive: true },
        create: { level, title, description, isActive: true },
      })

      // increment roleId
      roleId++
    }
  }

  async down(): Promise<void> {}

  private get userRoles(): {
    [role: string]: { level: number; title: string; description: string }
  } {
    return {
      SUPER_ADMIN: {
        level: 0,
        title: 'Super Admin',
        description: 'Able to login to the web portal as the Super Admin role ',
      },
      ADMIN: {
        level: 1,
        title: 'Admin',
        description: 'Able to login to the web portal as the Admin role ',
      },
      TESTER: {
        level: 2,
        title: 'Tester',
        description: 'Able to login to the web portal as the Tester role ',
      },
    }
  }
}
