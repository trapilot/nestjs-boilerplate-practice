import { Module } from '@nestjs/common'
import { ApiKeyModule, ApiKeySeedCommand } from 'modules/api-key'
import { AppVersionModule, AppVersionSeedCommand } from 'modules/app-version'
import { RoleModule, RoleSeedCommand } from 'modules/role'
import { SettingModule, SettingSeedCommand } from 'modules/setting'
import { TierModule, TierSeedCommand } from 'modules/tier'
import { UserModule, UserSeedCommand } from 'modules/user'

@Module({
  providers: [
    SettingSeedCommand,
    RoleSeedCommand,
    TierSeedCommand,
    UserSeedCommand,
    ApiKeySeedCommand,
    AppVersionSeedCommand,
  ],
  imports: [SettingModule, RoleModule, TierModule, UserModule, ApiKeyModule, AppVersionModule],
})
export class CommandsSeedModule {}
