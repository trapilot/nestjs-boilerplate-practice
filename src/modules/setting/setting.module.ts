import { Module } from '@nestjs/common'
import { SettingUtil } from './helpers/setting.util'
import { SettingService } from './services/setting.service'

@Module({
  providers: [SettingService, SettingUtil],
  exports: [SettingService, SettingUtil],
  imports: [],
})
export class SettingModule {}
