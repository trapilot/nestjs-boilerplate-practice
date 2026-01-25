import { EnumAppVersionPlatform, Prisma } from '@runtime/prisma-client'
import { CommandMigrateBase } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { Command } from 'nest-commander'

@Command({
  name: 'seed:app-version',
  description: 'Seed app versions',
})
export class AppVersionSeed extends CommandMigrateBase {
  private readonly dtos: Prisma.AppVersionCreateInput[] = []

  constructor(private readonly prisma: PrismaService) {
    super()

    this.dtos = [
      {
        name: EnumAppVersionPlatform.AOS,
        type: EnumAppVersionPlatform.AOS,
        version: '0.0.0',
      },
      {
        name: EnumAppVersionPlatform.IOS,
        type: EnumAppVersionPlatform.IOS,
        version: '0.0.0',
      },
    ]
  }

  async up(): Promise<void> {
    await this.prisma.$transaction(
      this.dtos.map(dto =>
        this.prisma.appVersion.upsert({
          where: {
            type_version: {
              type: dto.type,
              version: dto.version,
            },
          },
          create: dto,
          update: {},
        })
      )
    )
  }

  async down(): Promise<void> {
    await this.prisma.appVersion.deleteMany()
  }
}
