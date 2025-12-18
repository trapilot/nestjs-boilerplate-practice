import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ENUM_AUTH_SIGN_UP_FROM } from 'lib/nest-auth'
import { CryptoService, NEST_CLI } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { Command, CommandRunner } from 'nest-commander'

@Command({
  name: 'user:seed',
  description: 'Seed users',
})
export class UserSeedCommand extends CommandRunner {
  private readonly logger = new Logger(NEST_CLI)

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly cryptoService: CryptoService,
  ) {
    super()
  }

  async run(_: string[], __?: any): Promise<void> {
    this.logger.warn(`${UserSeedCommand.name} is running...`)

    try {
      if (process.env.MOCK_USER_PASS && process.env.MOCK_USER_EMAIL) {
        const passwordSaltLength = this.config.get<number>('auth.password.saltLength')
        const passwordSalt = this.cryptoService.randomSalt(passwordSaltLength)

        const hashedPassword = this.cryptoService.bcrypt(process.env.MOCK_USER_PASS, passwordSalt)

        await this.prisma.user.upsert({
          where: { email: process.env.MOCK_USER_EMAIL },
          create: {
            email: process.env.MOCK_USER_EMAIL,
            password: hashedPassword,
            isActive: true,
            isPhoneVerified: true,
            isEmailVerified: true,
            type: 'SUPER_ADMIN',
            signUpFrom: ENUM_AUTH_SIGN_UP_FROM.SEED,
            pivotRoles: {
              createMany: {
                data: [{ roleId: 1 }],
                skipDuplicates: true,
              },
            },
          },
          update: {},
        })
      }
    } catch (err: any) {
      this.logger.error(err)
    }
    return
  }
}
