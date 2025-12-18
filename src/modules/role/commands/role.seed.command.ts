import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ENUM_AUTH_SIGN_UP_FROM } from 'lib/nest-auth'
import { CryptoService, NEST_CLI } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { Command, CommandRunner } from 'nest-commander'

@Command({
  name: 'role:seed',
  description: 'Seed roles',
})
export class RoleSeedCommand extends CommandRunner {
  private readonly logger = new Logger(NEST_CLI)

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly cryptoService: CryptoService,
  ) {
    super()
  }

  async run(): Promise<void> {
    this.logger.warn(`${RoleSeedCommand.name} is running...`)

    try {
      const USER_ROLES = {
        SUPER_ADMIN: {
          level: 0,
          title: 'Super Admin',
          description: 'Able to login to the web portal as the Super Admin role ',
          users: [
            {
              phone: process.env.MOCK_MASTER_PHONE,
              email: process.env.MOCK_MASTER_EMAIL,
              password: process.env.MOCK_MASTER_PASS,
            },
          ],
        },
        ADMIN: {
          level: 1,
          title: 'Admin',
          description: 'Able to login to the web portal as the Admin role ',
          users: [
            {
              phone: process.env.MOCK_USER_PHONE,
              email: process.env.MOCK_USER_EMAIL,
              password: process.env.MOCK_USER_PASS,
            },
          ],
        },
        TESTER: {
          level: 1,
          title: 'Tester',
          description: 'Able to login to the web portal as the Tester role ',
          users: [
            {
              phone: process.env.MOCK_TESTER_PHONE,
              email: process.env.MOCK_TESTER_EMAIL,
              password: process.env.MOCK_TESTER_PASS,
            },
          ],
        },
      }

      const passwordSalt = this.cryptoService.randomSalt(
        this.config.get<number>('auth.password.saltLength'),
      )

      let roleId = 1
      let userId = 1
      for (const code in USER_ROLES) {
        const { level, title, description, users } = USER_ROLES[code]

        await this.prisma.role.upsert({
          where: { id: roleId },
          update: { level, isActive: true },
          create: { level, title, description, isActive: true },
        })

        for (const user of users) {
          if (!user.email && !user.password) continue

          const hashedPassword = this.cryptoService.bcrypt(user.password, passwordSalt)
          await this.prisma.user.upsert({
            where: { id: userId },
            create: {
              level,
              email: user.email,
              phone: user.phone,
              password: hashedPassword,
              isActive: true,
              isPhoneVerified: true,
              isEmailVerified: true,
              signUpFrom: ENUM_AUTH_SIGN_UP_FROM.SEED,
              pivotRoles: {
                createMany: {
                  data: [{ roleId: roleId }],
                  skipDuplicates: true,
                },
              },
            },
            update: {
              level: level,
              email: user.email,
              phone: user.phone,
              password: hashedPassword,
              isActive: true,
              isPhoneVerified: true,
              isEmailVerified: true,
              signUpFrom: ENUM_AUTH_SIGN_UP_FROM.SEED,
              pivotRoles: {
                createMany: {
                  data: [{ roleId: roleId }],
                  skipDuplicates: true,
                },
              },
            },
          })

          // increment userId
          userId++
        }

        // increment roleId
        roleId++
      }
    } catch (err: any) {
      console.log(err)
      this.logger.error(err)
    }
    return
  }
}
