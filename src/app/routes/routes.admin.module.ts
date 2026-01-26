import { Module } from '@nestjs/common'
import { ApiKeyAdminController, ApiKeyModule } from 'modules/api-key'
import { AppVersionAdminController, AppVersionModule } from 'modules/app-version'
import { DashboardAdminController, DashboardModule } from 'modules/dashboard'
import { InvoiceAdminController, InvoiceModule } from 'modules/invoice'
import { MediaAdminController, MediaModule } from 'modules/media'
import { MemberAdminController, MemberModule } from 'modules/member'
import { NotificationAdminController, NotificationModule } from 'modules/notification'
import { OrderAdminController, OrderModule } from 'modules/order'
import { PageAdminController, PageModule } from 'modules/page'
import { PermissionAdminController, PermissionModule } from 'modules/permission'
import { PointHistoryAdminController, PointHistoryModule } from 'modules/point-history'
import { ProductAdminController, ProductModule } from 'modules/product'
import { ProductBrandAdminController, ProductBrandModule } from 'modules/product-brand'
import { ProductCategoryAdminController, ProductCategoryModule } from 'modules/product-category'
import { ProductHistoryAdminController, ProductHistoryModule } from 'modules/product-history'
import { ProductReviewAdminController, ProductReviewModule } from 'modules/product-review'
import { RoleAdminController, RoleModule } from 'modules/role'
import { SettingAdminController, SettingModule } from 'modules/setting'
import { TierAdminController, TierModule } from 'modules/tier'
import { TierHistoryAdminController, TierHistoryModule } from 'modules/tier-history'
import { UserAdminController, UserAuthController, UserModule } from 'modules/user'

@Module({
  controllers: [
    UserAuthController,
    UserAdminController,
    SettingAdminController,
    DashboardAdminController,
    ApiKeyAdminController,
    AppVersionAdminController,
    RoleAdminController,
    PermissionAdminController,
    MemberAdminController,
    TierHistoryAdminController,
    PointHistoryAdminController,
    ProductHistoryAdminController,
    ProductAdminController,
    ProductBrandAdminController,
    ProductCategoryAdminController,
    ProductReviewAdminController,
    PageAdminController,
    TierAdminController,
    OrderAdminController,
    InvoiceAdminController,
    NotificationAdminController,
    MediaAdminController,
  ],
  imports: [
    UserModule,
    SettingModule,
    DashboardModule,
    ApiKeyModule,
    AppVersionModule,
    RoleModule,
    PermissionModule,
    MemberModule,
    TierHistoryModule,
    PointHistoryModule,
    ProductHistoryModule,
    ProductModule,
    ProductBrandModule,
    ProductCategoryModule,
    ProductReviewModule,
    PageModule,
    TierModule,
    OrderModule,
    InvoiceModule,
    NotificationModule,
    MediaModule,
  ],
})
export class RoutesAdminModule {}
