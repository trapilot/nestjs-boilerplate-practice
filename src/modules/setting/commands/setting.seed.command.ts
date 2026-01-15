import { EnumScopeType, LoggerService, ScopeAsync } from 'lib/nest-core'
import { Command, CommandRunner } from 'nest-commander'
import { EnumSettingGroup, EnumSettingType } from '../enums'
import { SettingService } from '../services'

@Command({
  name: 'setting:seed',
  description: 'Seed settings',
})
export class SettingSeedCommand extends CommandRunner {
  constructor(
    private readonly logger: LoggerService,
    private readonly settingService: SettingService,
  ) {
    super()
  }

  @ScopeAsync(EnumScopeType.COMMAND, { context: 'seed' })
  async run(): Promise<void> {
    this.logger.log(`${SettingSeedCommand.name} is running...`)

    try {
      await this.seed()
    } catch (err: any) {
      this.logger.error(err)
    } finally {
      this.logger.log(`${SettingSeedCommand.name} stoped`)
    }
    return
  }

  private async seed() {
    const exist = await this.settingService.match({ code: 'maintenance' })
    if (!exist) {
      await this.settingService.create({
        name: 'Maintenance Mode',
        code: 'maintenance',
        description: 'Maintenance Mode',
        group: EnumSettingGroup.SYSTEM,
        type: EnumSettingType.BOOLEAN,
        value: 'false',
        isVisible: false,
      })
    }
  }
}
