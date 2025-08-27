import { Logger } from '@nestjs/common'
import { NEST_CLI, NestHelper } from 'lib/nest-core'
import { Command, CommandRunner } from 'nest-commander'
import { ENUM_SETTING_GROUP, ENUM_SETTING_TYPE } from '../enums'
import { SettingService } from '../services'

@Command({
  name: 'setting:seed',
  description: 'Seed settings',
})
export class SettingSeedCommand extends CommandRunner {
  private readonly logger = new Logger(NEST_CLI)

  constructor(private readonly settingService: SettingService) {
    super()
  }

  async run(): Promise<void> {
    this.logger.warn(`${SettingSeedCommand.name} is running...`)
    try {
      await this.maintenance()
    } catch (err: any) {}
    return
  }

  private async maintenance() {
    const exist = await this.settingService.match({ code: 'maintenance' })
    if (!exist) {
      await this.settingService.create({
        name: 'Maintenance Mode',
        code: 'maintenance',
        group: ENUM_SETTING_GROUP.SYSTEM,
        description: 'Maintenance Mode',
        type: ENUM_SETTING_TYPE.BOOLEAN,
        value: 'false',
        isVisible: false,
      })
    }
  }
}
