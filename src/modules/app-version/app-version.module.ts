import { Module } from '@nestjs/common'
import { AppVersionService } from './services/app-version.service'

@Module({
  providers: [AppVersionService],
  exports: [AppVersionService],
  imports: [],
})
export class AppVersionModule {}
