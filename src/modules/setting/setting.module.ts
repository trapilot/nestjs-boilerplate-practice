import { Module } from '@nestjs/common'
import { SettingUtil } from './helpers'
import { SettingService } from './services'

@Module({
  providers: [SettingService, SettingUtil],
  exports: [SettingService, SettingUtil],
  imports: [],
})
export class SettingModule {}
