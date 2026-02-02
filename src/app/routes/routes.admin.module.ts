import { Module } from '@nestjs/common'
import { ApiKeyModule } from 'modules/api-key/api-key.module'
import { ApiKeyAdminController } from 'modules/api-key/controllers/api-key.admin.controller'
import { AppVersionModule } from 'modules/app-version/app-version.module'
import { AppVersionAdminController } from 'modules/app-version/controllers/app-version.admin.controller'
import { DashboardAdminController } from 'modules/dashboard/controllers/dashboard.admin.controller'
import { DashboardModule } from 'modules/dashboard/dashboard.module'
import { InvoiceAdminController } from 'modules/invoice/controllers/invoice.admin.controller'
import { InvoiceModule } from 'modules/invoice/invoice.module'
import { MediaAdminController } from 'modules/media/controllers/media.admin.controller'
import { MediaModule } from 'modules/media/media.module'
import { MemberPointAdminController } from 'modules/member-point/controllers/member-point.admin.controller'
import { MemberPointModule } from 'modules/member-point/member-point.module'
import { MemberRedemptionAdminController } from 'modules/member-redemption/controllers/member-redemption.admin.controller'
import { MemberRedemptionModule } from 'modules/member-redemption/member-redemption.module'
import { MemberTierAdminController } from 'modules/member-tier/controllers/member-tier.admin.controller'
import { MemberTierModule } from 'modules/member-tier/member-tier.module'
import { MemberAdminController } from 'modules/member/controllers/member.admin.controller'
import { MemberModule } from 'modules/member/member.module'
import { NotificationAdminController } from 'modules/notification/controllers/notification.admin.controller'
import { NotificationModule } from 'modules/notification/notification.module'
import { OrderAdminController } from 'modules/order/controllers/order.admin.controller'
import { OrderModule } from 'modules/order/order.module'
import { PageAdminController } from 'modules/page/controllers/page.admin.controller'
import { PageModule } from 'modules/page/page.module'
import { PermissionAdminController } from 'modules/permission/controllers/permission.admin.controller'
import { PermissionModule } from 'modules/permission/permission.module'
import { ProductBrandAdminController } from 'modules/product-brand/controllers/product-brand.admin.controller'
import { ProductBrandModule } from 'modules/product-brand/product-brand.module'
import { ProductCategoryAdminController } from 'modules/product-category/controllers/product-category.admin.controller'
import { ProductCategoryModule } from 'modules/product-category/product-category.module'
import { ProductReviewAdminController } from 'modules/product-review/controllers/product-review.admin.controller'
import { ProductReviewModule } from 'modules/product-review/product-review.module'
import { ProductAdminController } from 'modules/product/controllers/product.admin.controller'
import { ProductModule } from 'modules/product/product.module'
import { RoleAdminController } from 'modules/role/controllers/role.admin.controller'
import { RoleModule } from 'modules/role/role.module'
import { SettingAdminController } from 'modules/setting/controllers/setting.admin.controller'
import { SettingModule } from 'modules/setting/setting.module'
import { TierAdminController } from 'modules/tier/controllers/tier.admin.controller'
import { TierModule } from 'modules/tier/tier.module'
import { UserAdminController } from 'modules/user/controllers/user.admin.controller'
import { UserAuthController } from 'modules/user/controllers/user.auth.controller'
import { UserModule } from 'modules/user/user.module'

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
