import { Module } from '@nestjs/common'
import { AppVersionService } from './services'

@Module({
  providers: [AppVersionService],
  exports: [AppVersionService],
  imports: [],
})
export class AppVersionModule {}
