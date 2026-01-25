import { Module } from '@nestjs/common'
import { ApiKeyModule } from 'modules/api-key'
import { AppVersionModule } from 'modules/app-version'
import { SettingModule } from 'modules/setting'
import {
  ApiKeySeed,
  AppVersionSeed,
  RoleSeed,
  SettingSeed,
  TierSeed,
  UserRoleSeed,
  UserSeed
} from './seeds'

@Module({
  providers: [
    ApiKeySeed,
    AppVersionSeed,
    RoleSeed,
    SettingSeed,
    TierSeed,
    UserSeed,
    UserRoleSeed,
  ],
  imports: [ApiKeyModule, AppVersionModule, SettingModule],
})
export class DataSeedModule {}
