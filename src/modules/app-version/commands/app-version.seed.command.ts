import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ENUM_APP_VERSION_PLATFORM } from '@prisma/client'
import { NEST_CLI, NestHelper } from 'lib/nest-core'
import { Command, CommandRunner } from 'nest-commander'
import { AppVersionService } from '../services'

@Command({
  name: 'app-version:seed',
  description: 'Seed App Version',
})
export class AppVersionSeedCommand extends CommandRunner {
  private readonly logger = new Logger(NEST_CLI)

  constructor(
    private readonly config: ConfigService,
    private readonly appVersionService: AppVersionService,
  ) {
    super()
  }

  async run(): Promise<void> {
    this.logger.warn(`${AppVersionSeedCommand.name} is running...`)

    try {
      await this.appVersionService.create({
        name: ENUM_APP_VERSION_PLATFORM.AOS,
        type: ENUM_APP_VERSION_PLATFORM.AOS,
        version: '0.0.1',
        isActive: true,
        isForce: false,
      })
      await this.appVersionService.create({
        name: ENUM_APP_VERSION_PLATFORM.IOS,
        type: ENUM_APP_VERSION_PLATFORM.IOS,
        version: '0.0.1',
        isActive: true,
        isForce: false,
      })
      await this.appVersionService.create({
        name: ENUM_APP_VERSION_PLATFORM.WEB,
        type: ENUM_APP_VERSION_PLATFORM.WEB,
        version: '0.0.1',
        isActive: true,
        isForce: false,
      })
    } catch (err: any) {}
    return
  }
}
