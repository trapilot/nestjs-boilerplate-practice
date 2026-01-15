import { ConfigService } from '@nestjs/config'
import { EnumAuthSignUpFrom } from 'lib/nest-auth'
import { CryptoService, EnumScopeType, LoggerService, ScopeAsync } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { Command, CommandRunner } from 'nest-commander'

@Command({
  name: 'user:seed',
  description: '[Develop] Seed users',
})
export class UserSeedCommand extends CommandRunner {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly crypto: CryptoService
  ) {
    super()
  }

  @ScopeAsync(EnumScopeType.COMMAND, { context: 'seed' })
  async run(_passedParam: string[], _options?: Record<string, string | number>): Promise<void> {
    this.logger.log(`${UserSeedCommand.name} is running...`)

    try {
      await this.seed()
    } catch (err: unknown) {
      this.logger.error(err)
    } finally {
      this.logger.log(`${UserSeedCommand.name} stoped`)
    }
    return
  }

  async seed(): Promise<boolean> {
    if (!process.env.MOCK_USER_PASS || !process.env.MOCK_USER_EMAIL) {
      return
    }

    const passwordSaltLength = this.config.get<number>('auth.password.saltLength')
    const passwordSalt = this.crypto.randomSalt(passwordSaltLength)
    const hashedPassword = this.crypto.bcrypt(process.env.MOCK_USER_PASS, passwordSalt)

    await this.prisma.user.upsert({
      where: { email: process.env.MOCK_USER_EMAIL },
      create: {
        email: process.env.MOCK_USER_EMAIL,
        password: hashedPassword,
        isActive: true,
        isPhoneVerified: true,
        isEmailVerified: true,
        type: 'SUPER_ADMIN',
        signUpFrom: EnumAuthSignUpFrom.CMD,
        pivotRoles: {
          createMany: {
            data: [{ roleId: 1 }],
            skipDuplicates: true,
          },
        },
      },
      update: {},
    })
    return true
  }
}
