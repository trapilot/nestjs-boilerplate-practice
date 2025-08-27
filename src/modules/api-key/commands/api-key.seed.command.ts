import { Logger } from '@nestjs/common'
import { ENUM_API_KEY_TYPE } from '@prisma/client'
import { NEST_CLI } from 'lib/nest-core'
import { Command, CommandRunner } from 'nest-commander'
import { ApiKeyService } from '../services'

@Command({
  name: 'api-key:seed',
  description: 'Seed api keys',
})
export class ApiKeySeedCommand extends CommandRunner {
  private readonly logger = new Logger(NEST_CLI)

  constructor(private readonly apiKeyService: ApiKeyService) {
    super()
  }

  async run(): Promise<void> {
    this.logger.warn(`${ApiKeySeedCommand.name} is running...`)

    try {
      const { key, hash } = await this.apiKeyService.createHashApiKey()
      await this.apiKeyService.create({
        name: `Api Key For ${ENUM_API_KEY_TYPE.CLIENT}`,
        type: ENUM_API_KEY_TYPE.CLIENT,
        isActive: true,
        isDeprecated: true,
        key,
        hash,
      })
    } catch (err: any) {
      throw new Error(err.message)
    }

    return
  }
}
