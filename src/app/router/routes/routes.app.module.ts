import { Module } from '@nestjs/common'
import { CartAppController, CartModule } from 'src/modules/cart'
import { CountryAppController, CountryModule } from 'src/modules/country'
import { DistrictAppController, DistrictModule } from 'src/modules/district'
import { FactAppController, FactModule } from 'src/modules/fact'
import { InvoiceAppController, InvoiceModule } from 'src/modules/invoice'
import { MediaAppController, MediaModule } from 'src/modules/media'
import {
  MemberAppController,
  MemberAuthController,
  MemberAuthModule,
  MemberModule,
} from 'src/modules/member'
import { PointHistoryAppController, PointHistoryModule } from 'src/modules/point-history'
import { ProductAppController, ProductModule } from 'src/modules/product'
import { ProductBrandAppController, ProductBrandModule } from 'src/modules/product-brand'
import { ProductCategoryAppController, ProductCategoryModule } from 'src/modules/product-category'
import { ProductHistoryAppController, ProductHistoryModule } from 'src/modules/product-history'
import { TierAppController, TierModule } from 'src/modules/tier'

@Module({
  controllers: [
    MemberAuthController,
    MemberAppController,
    FactAppController,
    CountryAppController,
    DistrictAppController,
    TierAppController,
    CartAppController,
    InvoiceAppController,
    PointHistoryAppController,
    ProductHistoryAppController,
    MediaAppController,
    ProductAppController,
    ProductBrandAppController,
    ProductCategoryAppController,
  ],
  imports: [
    MemberAuthModule,
    MemberModule,
    FactModule,
    CountryModule,
    DistrictModule,
    TierModule,
    CartModule,
    InvoiceModule,
    PointHistoryModule,
    ProductHistoryModule,
    MediaModule,
    ProductModule,
    ProductBrandModule,
    ProductCategoryModule,
  ],
})
export class RoutesAppModule {}
