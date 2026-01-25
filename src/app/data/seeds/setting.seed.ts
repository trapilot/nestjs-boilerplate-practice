import { Prisma } from '@runtime/prisma-client'
import { CommandMigrateBase } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { EnumSettingGroup, EnumSettingType, SettingService } from 'modules/setting'
import { Command } from 'nest-commander'

@Command({
  name: 'seed:setting',
  description: 'Seed settings',
})
export class SettingSeed extends CommandMigrateBase {
  private readonly dtos: Prisma.SettingCreateInput[] = []

  constructor(
    private readonly prisma: PrismaService,
    private readonly settingService: SettingService
  ) {
    super()

    this.dtos = [
      {
        name: 'Maintenance Mode',
        code: 'maintenance',
        description: 'Maintenance Mode',
        group: EnumSettingGroup.SYSTEM,
        type: EnumSettingType.BOOLEAN,
        value: 'false',
        isVisible: false,
      },
    ]
  }

  async up(): Promise<void> {
    await this.prisma.$transaction(
      this.dtos.map(dto =>
        this.prisma.setting.upsert({
          where: { code: dto.code },
          create: dto,
          update: {},
        })
      )
    )
  }

  async down(): Promise<void> {
    await this.settingService.deleteMany()
  }
}
