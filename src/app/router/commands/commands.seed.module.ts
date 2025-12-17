import { Module } from '@nestjs/common'
import { ENUM_APP_CMD_TYPE } from 'lib/nest-core'
import { ApiKeyModule } from 'modules/api-key'
import { AppVersionModule } from 'modules/app-version'
import { CartModule } from 'modules/cart'
import { FactModule } from 'modules/fact'
import { MemberModule } from 'modules/member'
import { PermissionModule } from 'modules/permission'
import { ProductModule } from 'modules/product'
import { RoleModule } from 'modules/role'
import { SettingModule } from 'modules/setting'
import { TierModule } from 'modules/tier'
import { UserModule } from 'modules/user'

@Module({
  providers: [
    ...SettingModule.commands(ENUM_APP_CMD_TYPE.SEED),
    ...RoleModule.commands(ENUM_APP_CMD_TYPE.SEED),
    ...PermissionModule.commands(ENUM_APP_CMD_TYPE.SEED),
    ...UserModule.commands(ENUM_APP_CMD_TYPE.SEED),
    ...FactModule.commands(ENUM_APP_CMD_TYPE.SEED),
    ...ApiKeyModule.commands(ENUM_APP_CMD_TYPE.SEED),
    ...AppVersionModule.commands(ENUM_APP_CMD_TYPE.SEED),
    ...MemberModule.commands(ENUM_APP_CMD_TYPE.SEED),
    ...ProductModule.commands(ENUM_APP_CMD_TYPE.SEED),
    ...CartModule.commands(ENUM_APP_CMD_TYPE.SEED),
    ...TierModule.commands(ENUM_APP_CMD_TYPE.SEED),
  ],
  imports: [
    SettingModule,
    RoleModule,
    PermissionModule,
    UserModule,
    FactModule,
    ApiKeyModule,
    AppVersionModule,
    MemberModule,
    ProductModule,
    CartModule,
    TierModule,
  ],
})
export class CommandsSeedModule {}
