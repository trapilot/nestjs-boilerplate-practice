import { Module } from '@nestjs/common'
import { ApiKeyAdminController, ApiKeyModule } from 'src/modules/api-key'
import { AppVersionAdminController, AppVersionModule } from 'src/modules/app-version'
import { DashboardAdminController, DashboardModule } from 'src/modules/dashboard'
import { FactAdminController, FactModule } from 'src/modules/fact'
import { InvoiceAdminController, InvoiceModule } from 'src/modules/invoice'
import { MediaAdminController, MediaModule } from 'src/modules/media'
import { MemberAdminController, MemberModule } from 'src/modules/member'
import { NotificationAdminController, NotificationModule } from 'src/modules/notification'
import { OrderAdminController, OrderModule } from 'src/modules/order'
import { PermissionAdminController, PermissionModule } from 'src/modules/permission'
import { PointHistoryAdminController, PointHistoryModule } from 'src/modules/point-history'
import { ProductAdminController, ProductModule } from 'src/modules/product'
import { ProductBrandAdminController, ProductBrandModule } from 'src/modules/product-brand'
import { ProductCategoryAdminController, ProductCategoryModule } from 'src/modules/product-category'
import { ProductHistoryAdminController, ProductHistoryModule } from 'src/modules/product-history'
import { PushAdminController, PushModule } from 'src/modules/push'
import { RoleAdminController, RoleModule } from 'src/modules/role'
import { SettingAdminController, SettingModule } from 'src/modules/setting'
import { TierAdminController, TierModule } from 'src/modules/tier'
import { TierHistoryAdminController, TierHistoryModule } from 'src/modules/tier-history'
import {
  UserAdminController,
  UserAuthController,
  UserAuthModule,
  UserModule,
} from 'src/modules/user'

@Module({
  controllers: [
    UserAuthController,
    SettingAdminController,
    DashboardAdminController,
    ApiKeyAdminController,
    AppVersionAdminController,
    UserAdminController,
    RoleAdminController,
    PermissionAdminController,
    MemberAdminController,
    TierHistoryAdminController,
    PointHistoryAdminController,
    ProductHistoryAdminController,
    ProductAdminController,
    ProductBrandAdminController,
    ProductCategoryAdminController,
    FactAdminController,
    TierAdminController,
    OrderAdminController,
    InvoiceAdminController,
    NotificationAdminController,
    PushAdminController,
    MediaAdminController,
  ],
  imports: [
    UserAuthModule,
    SettingModule,
    DashboardModule,
    ApiKeyModule,
    AppVersionModule,
    UserModule,
    RoleModule,
    PermissionModule,
    MemberModule,
    TierHistoryModule,
    PointHistoryModule,
    ProductHistoryModule,
    ProductModule,
    ProductBrandModule,
    ProductCategoryModule,
    FactModule,
    TierModule,
    OrderModule,
    InvoiceModule,
    NotificationModule,
    PushModule,
    MediaModule,
  ],
})
export class RoutesAdminModule {}
