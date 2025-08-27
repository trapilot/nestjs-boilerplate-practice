import { Command, CommandRunner } from 'nest-commander'
import { SettingService } from '../services'

@Command({
  name: 'setting:remove',
  description: 'Remove settings',
})
export class SettingRemoveCommand extends CommandRunner {
  constructor(private readonly settingService: SettingService) {
    super()
  }

  async run(): Promise<void> {
    try {
      await this.settingService.deleteMany()
    } catch (err: any) {
      throw new Error(err.message)
    }

    return
  }
}
