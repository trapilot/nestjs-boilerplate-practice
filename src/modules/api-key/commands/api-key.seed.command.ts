import { EnumApiKeyType } from '@runtime/prisma-client'
import { EnumScopeType, LoggerService, OnScope } from 'lib/nest-core'
import { Command, CommandRunner } from 'nest-commander'
import { ApiKeyService } from '../services'

@Command({
  name: 'api-key:seed',
  description: 'Seed api keys',
})
export class ApiKeySeedCommand extends CommandRunner {
  constructor(
    private readonly logger: LoggerService,
    private readonly apiKeyService: ApiKeyService
  ) {
    super()
  }

  @OnScope(EnumScopeType.COMMAND, { context: 'seed', async: true })
  async run(_passedParam: string[], _options?: Record<string, string | number>): Promise<void> {
    this.logger.log(`${ApiKeySeedCommand.name} is running...`)

    try {
      await this.seed()
    } catch (err: unknown) {
      this.logger.error(err)
    } finally {
      this.logger.log(`${ApiKeySeedCommand.name} stoped`)
    }

    return
  }

  async seed(): Promise<boolean> {
    const { key, hash } = await this.apiKeyService.createHashApiKey()
    await this.apiKeyService.create({
      name: `Api Key For ${EnumApiKeyType.CLIENT}`,
      type: EnumApiKeyType.CLIENT,
      isActive: true,
      isDeprecated: true,
      key,
      hash,
    })
    return true
  }
}
