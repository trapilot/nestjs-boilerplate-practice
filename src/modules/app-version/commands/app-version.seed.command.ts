import { EnumAppVersionPlatform } from '@runtime/prisma-client'
import { EnumScopeType, LoggerService, ScopeAsync } from 'lib/nest-core'
import { Command, CommandRunner } from 'nest-commander'
import { AppVersionService } from '../services'

@Command({
  name: 'app-version:seed',
  description: 'Seed App Version',
})
export class AppVersionSeedCommand extends CommandRunner {
  constructor(
    private readonly logger: LoggerService,
    private readonly appVersionService: AppVersionService,
  ) {
    super()
  }

  @ScopeAsync(EnumScopeType.COMMAND, { context: 'seed' })
  async run(): Promise<void> {
    this.logger.log(`${AppVersionSeedCommand.name} is running...`)

    try {
      await this.seed()
    } catch (err: any) {
      this.logger.error(err)
    } finally {
      this.logger.log(`${AppVersionSeedCommand.name} stoped`)
    }
    return
  }

  async seed() {
    await this.appVersionService.create({
      name: EnumAppVersionPlatform.AOS,
      type: EnumAppVersionPlatform.AOS,
      version: '0.0.0',
      isActive: true,
      isForce: true,
    })
    await this.appVersionService.create({
      name: EnumAppVersionPlatform.IOS,
      type: EnumAppVersionPlatform.IOS,
      version: '0.0.0',
      isActive: true,
      isForce: true,
    })
  }
}
