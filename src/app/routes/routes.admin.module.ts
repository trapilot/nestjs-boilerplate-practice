import { Module } from '@nestjs/common'
import { ApiKeyAdminController, ApiKeyModule } from 'modules/api-key'
import { AppVersionAdminController, AppVersionModule } from 'modules/app-version'
import { DashboardAdminController, DashboardModule } from 'modules/dashboard'
import { InvoiceAdminController, InvoiceModule } from 'modules/invoice'
import { MediaAdminController, MediaModule } from 'modules/media'
import { MemberAdminController, MemberModule } from 'modules/member'
import { MemberPointAdminController, MemberPointModule } from 'modules/member-point'
import { MemberRedemptionAdminController, MemberRedemptionModule } from 'modules/member-redemption'
import { MemberTierAdminController, MemberTierModule } from 'modules/member-tier'
import { NotificationAdminController, NotificationModule } from 'modules/notification'
import { OrderAdminController, OrderModule } from 'modules/order'
import { PageAdminController, PageModule } from 'modules/page'
import { PermissionAdminController, PermissionModule } from 'modules/permission'
import { ProductAdminController, ProductModule } from 'modules/product'
import { ProductBrandAdminController, ProductBrandModule } from 'modules/product-brand'
import { ProductCategoryAdminController, ProductCategoryModule } from 'modules/product-category'
import { ProductReviewAdminController, ProductReviewModule } from 'modules/product-review'
import { RoleAdminController, RoleModule } from 'modules/role'
import { SettingAdminController, SettingModule } from 'modules/setting'
import { TierAdminController, TierModule } from 'modules/tier'
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
    MemberTierAdminController,
    MemberPointAdminController,
    MemberRedemptionAdminController,
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
    MemberTierModule,
    MemberPointModule,
    MemberRedemptionModule,
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
