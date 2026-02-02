import { Module } from '@nestjs/common'
import { ApiKeyUtil } from './helpers/api-key.util'
import { ApiKeyService } from './services/api-key.service'

@Module({
  providers: [ApiKeyService, ApiKeyUtil],
  exports: [ApiKeyService, ApiKeyUtil],
  imports: [],
})
export class ApiKeyModule {}
