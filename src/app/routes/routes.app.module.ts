import { Module } from '@nestjs/common'
import { CartAppController, CartModule } from 'modules/cart'
import { CountryAppController, CountryModule } from 'modules/country'
import { DistrictAppController, DistrictModule } from 'modules/district'
import { InvoiceAppController, InvoiceModule } from 'modules/invoice'
import { MediaAppController, MediaModule } from 'modules/media'
import { MemberAppController, MemberAuthController, MemberModule } from 'modules/member'
import { MemberPointAppController, MemberPointModule } from 'modules/member-point'
import { MemberRedemptionAppController, MemberRedemptionModule } from 'modules/member-redemption'
import { PageAppController, PageModule } from 'modules/page'
import { ProductAppController, ProductModule } from 'modules/product'
import { ProductBrandAppController, ProductBrandModule } from 'modules/product-brand'
import { ProductCategoryAppController, ProductCategoryModule } from 'modules/product-category'
import { TierAppController, TierModule } from 'modules/tier'

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
