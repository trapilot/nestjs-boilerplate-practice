import { Module } from '@nestjs/common'
import { ApiKeyModule } from 'modules/api-key/api-key.module'
import { AppVersionModule } from 'modules/app-version/app-version.module'
import { SettingModule } from 'modules/setting/setting.module'
import { ApiKeySeed } from './seeds/api-key.seed'
import { AppVersionSeed } from './seeds/app-version.seed'
import { PointSchemaSeed } from './seeds/point-schema.seed'
import { RoleSeed } from './seeds/role.seed'
import { SettingSeed } from './seeds/setting.seed'
import { TierSeed } from './seeds/tier.seed'
import { UserRoleSeed } from './seeds/user-role.seed'
import { UserSeed } from './seeds/user.seed'

@Module({
  providers: [
    ApiKeySeed,
    AppVersionSeed,
    RoleSeed,
    SettingSeed,
    TierSeed,
    PointSchemaSeed,
    UserSeed,
    UserRoleSeed,
  ],
  imports: [ApiKeyModule, AppVersionModule, SettingModule],
})
export class DataSeedModule {}
