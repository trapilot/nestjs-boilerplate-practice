import { Module } from '@nestjs/common'
import { ApiKeyUtil } from './helpers'
import { ApiKeyService } from './services'

@Module({
  providers: [ApiKeyService, ApiKeyUtil],
  exports: [ApiKeyService, ApiKeyUtil],
  imports: [],
})
export class ApiKeyModule {}
