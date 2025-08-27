import { Module } from '@nestjs/common'
import { ApiKeyModule, ApiKeySeedCommand } from 'src/modules/api-key'
import { AppVersionModule, AppVersionSeedCommand } from 'src/modules/app-version'
import { CartModule, CartSeedCommand } from 'src/modules/cart'
import { FactModule, FactSeedCommand } from 'src/modules/fact'
import { InvoiceModule } from 'src/modules/invoice'
import { MemberModule, MemberSeedCommand } from 'src/modules/member'
import { OrderModule } from 'src/modules/order'
import { PermissionModule, PermissionSeedCommand } from 'src/modules/permission'
import { ProductModule, ProductSeedCommand } from 'src/modules/product'
import { RoleModule, RoleSeedCommand } from 'src/modules/role'
import { SettingModule, SettingSeedCommand } from 'src/modules/setting'
import { TierModule, TierSeedCommand } from 'src/modules/tier'
import { UserModule, UserSeedCommand } from 'src/modules/user'

@Module({
  providers: [
    SettingSeedCommand,
    RoleSeedCommand,
    PermissionSeedCommand,
    UserSeedCommand,
    FactSeedCommand,
    ApiKeySeedCommand,
    AppVersionSeedCommand,
    MemberSeedCommand,
    ProductSeedCommand,
    CartSeedCommand,
    TierSeedCommand,
  ],
  imports: [
    SettingModule,
    RoleModule,
    PermissionModule,
    FactModule,
    ApiKeyModule,
    AppVersionModule,
    UserModule,
    MemberModule,
    ProductModule,
    CartModule,
    InvoiceModule,
    OrderModule,
    TierModule,
  ],
})
export class CommandsSeedModule {}
