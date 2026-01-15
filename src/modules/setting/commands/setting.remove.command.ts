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

  async run(_passedParam: string[], _options?: Record<string, string | number>): Promise<void> {
    try {
      await this.settingService.deleteMany()
    } catch (err: unknown) {
      throw err
    }

    return
  }
}
