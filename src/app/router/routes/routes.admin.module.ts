import { Module } from '@nestjs/common'
import { ENUM_APP_API_TYPE } from 'lib/nest-core'
import { ApiKeyModule } from 'modules/api-key'
import { AppVersionModule } from 'modules/app-version'
import { DashboardModule } from 'modules/dashboard'
import { FactModule } from 'modules/fact'
import { InvoiceModule } from 'modules/invoice'
import { MediaModule } from 'modules/media'
import { MemberModule } from 'modules/member'
import { NotificationModule } from 'modules/notification'
import { OrderModule } from 'modules/order'
import { PermissionModule } from 'modules/permission'
import { PointHistoryModule } from 'modules/point-history'
import { ProductModule } from 'modules/product'
import { ProductBrandModule } from 'modules/product-brand'
import { ProductCategoryModule } from 'modules/product-category'
import { ProductHistoryModule } from 'modules/product-history'
import { ProductReviewModule } from 'modules/product-review'
import { PushModule } from 'modules/push'
import { RoleModule } from 'modules/role'
import { SettingModule } from 'modules/setting'
import { TierModule } from 'modules/tier'
import { TierHistoryModule } from 'modules/tier-history'
import { UserAuthModule, UserModule } from 'modules/user'

@Module({
  controllers: [
    ...UserAuthModule.controllers(ENUM_APP_API_TYPE.CMS),
    ...SettingModule.controllers(ENUM_APP_API_TYPE.CMS),
    ...DashboardModule.controllers(ENUM_APP_API_TYPE.CMS),
    ...ApiKeyModule.controllers(ENUM_APP_API_TYPE.CMS),
    ...AppVersionModule.controllers(ENUM_APP_API_TYPE.CMS),
    ...UserModule.controllers(ENUM_APP_API_TYPE.CMS),
    ...RoleModule.controllers(ENUM_APP_API_TYPE.CMS),
    ...PermissionModule.controllers(ENUM_APP_API_TYPE.CMS),
    ...MemberModule.controllers(ENUM_APP_API_TYPE.CMS),
    ...TierHistoryModule.controllers(ENUM_APP_API_TYPE.CMS),
    ...PointHistoryModule.controllers(ENUM_APP_API_TYPE.CMS),
    ...ProductHistoryModule.controllers(ENUM_APP_API_TYPE.CMS),
    ...ProductModule.controllers(ENUM_APP_API_TYPE.CMS),
    ...ProductBrandModule.controllers(ENUM_APP_API_TYPE.CMS),
    ...ProductCategoryModule.controllers(ENUM_APP_API_TYPE.CMS),
    ...ProductReviewModule.controllers(ENUM_APP_API_TYPE.CMS),
    ...FactModule.controllers(ENUM_APP_API_TYPE.CMS),
    ...TierModule.controllers(ENUM_APP_API_TYPE.CMS),
    ...OrderModule.controllers(ENUM_APP_API_TYPE.CMS),
    ...InvoiceModule.controllers(ENUM_APP_API_TYPE.CMS),
    ...NotificationModule.controllers(ENUM_APP_API_TYPE.CMS),
    ...PushModule.controllers(ENUM_APP_API_TYPE.CMS),
    ...MediaModule.controllers(ENUM_APP_API_TYPE.CMS),
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
    ProductReviewModule,
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
