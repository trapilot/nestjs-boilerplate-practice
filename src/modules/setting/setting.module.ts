import { Module } from '@nestjs/common'
import { SettingService } from './services'

@Module({
  exports: [SettingService],
  providers: [SettingService],
  imports: [],
})
export class SettingModule {}
