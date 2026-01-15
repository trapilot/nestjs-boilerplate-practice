import { Module } from '@nestjs/common'
import { ApiKeyService } from './services'

@Module({
  providers: [ApiKeyService],
  exports: [ApiKeyService],
  imports: [],
})
export class ApiKeyModule {}
