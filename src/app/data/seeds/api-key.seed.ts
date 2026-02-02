import { EnumApiKeyType } from '@runtime/prisma-client'
import { CommandMigrateBase } from 'lib/nest-core'
import { ApiKeyService } from 'modules/api-key/services/api-key.service'
import { Command } from 'nest-commander'

@Command({
  name: 'seed:api-key',
  description: 'Seed api keys',
})
export class ApiKeySeed extends CommandMigrateBase {
  constructor(private readonly apiKeyService: ApiKeyService) {
    super()
  }

  async up(): Promise<void> {
    await this.apiKeyService.create({
      name: `Api Key For ${EnumApiKeyType.CLIENT}`,
      type: EnumApiKeyType.CLIENT,
      isActive: true,
      isDeprecated: true,
    })
  }

  async down(): Promise<void> {}
}
