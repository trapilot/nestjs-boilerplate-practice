import { Module } from '@nestjs/common'
import { SettingService } from './services'

@Module({
  providers: [SettingService],
  exports: [SettingService],
  imports: [],
})
export class SettingModule {}
