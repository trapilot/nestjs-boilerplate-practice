import { Module } from '@nestjs/common'
import { PushService } from './services'

@Module({
  providers: [PushService],
  exports: [PushService],
  imports: [],
})
export class PushModule {}
