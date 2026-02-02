import { Module } from '@nestjs/common'
import { CartModule } from 'modules/cart/cart.module'
import { CartAppController } from 'modules/cart/controllers/cart.app.controller'
import { CountryAppController } from 'modules/country/controllers/country.app.controller'
import { CountryModule } from 'modules/country/country.module'
import { DistrictAppController } from 'modules/district/controllers/district.app.controller'
import { DistrictModule } from 'modules/district/district.module'
import { InvoiceAppController } from 'modules/invoice/controllers/invoice.app.controller'
import { InvoiceModule } from 'modules/invoice/invoice.module'
import { MediaAppController } from 'modules/media/controllers/media.app.controller'
import { MediaModule } from 'modules/media/media.module'
import { MemberPointAppController } from 'modules/member-point/controllers/member-point.app.controller'
import { MemberPointModule } from 'modules/member-point/member-point.module'
import { MemberRedemptionAppController } from 'modules/member-redemption/controllers/member-redemption.app.controller'
import { MemberRedemptionModule } from 'modules/member-redemption/member-redemption.module'
import { MemberAppController } from 'modules/member/controllers/member.app.controller'
import { MemberAuthController } from 'modules/member/controllers/member.auth.controller'
import { MemberModule } from 'modules/member/member.module'
import { PageAppController } from 'modules/page/controllers/page.app.controller'
import { PageModule } from 'modules/page/page.module'
import { ProductBrandAppController } from 'modules/product-brand/controllers/product-brand.app.controller'
import { ProductBrandModule } from 'modules/product-brand/product-brand.module'
import { ProductCategoryAppController } from 'modules/product-category/controllers/product-category.app.controller'
import { ProductCategoryModule } from 'modules/product-category/product-category.module'
import { ProductAppController } from 'modules/product/controllers/product.app.controller'
import { ProductModule } from 'modules/product/product.module'
import { TierAppController } from 'modules/tier/controllers/tier.app.controller'
import { TierModule } from 'modules/tier/tier.module'

@Module({
  controllers: [
    MemberAuthController,
    MemberAppController,
    PageAppController,
    CountryAppController,
    DistrictAppController,
    TierAppController,
    CartAppController,
    InvoiceAppController,
    MemberPointAppController,
    MemberRedemptionAppController,
    MediaAppController,
    ProductAppController,
    ProductBrandAppController,
    ProductCategoryAppController,
  ],
  imports: [
    MemberModule,
    PageModule,
    CountryModule,
    DistrictModule,
    TierModule,
    CartModule,
    InvoiceModule,
    MemberPointModule,
    MemberRedemptionModule,
    MediaModule,
    ProductModule,
    ProductBrandModule,
    ProductCategoryModule,
  ],
})
export class RoutesAppModule {}
