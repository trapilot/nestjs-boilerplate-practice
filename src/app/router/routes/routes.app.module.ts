import { Module } from '@nestjs/common'
import { ENUM_APP_API_TYPE } from 'lib/nest-core'
import { CartModule } from 'modules/cart'
import { CountryModule } from 'modules/country'
import { DistrictModule } from 'modules/district'
import { FactModule } from 'modules/fact'
import { InvoiceModule } from 'modules/invoice'
import { MediaModule } from 'modules/media'
import { MemberAuthModule, MemberModule } from 'modules/member'
import { PointHistoryModule } from 'modules/point-history'
import { ProductModule } from 'modules/product'
import { ProductBrandModule } from 'modules/product-brand'
import { ProductCategoryModule } from 'modules/product-category'
import { ProductHistoryModule } from 'modules/product-history'
import { TierModule } from 'modules/tier'

@Module({
  controllers: [
    ...MemberAuthModule.controllers(ENUM_APP_API_TYPE.APP),
    ...MemberModule.controllers(ENUM_APP_API_TYPE.APP),
    ...FactModule.controllers(ENUM_APP_API_TYPE.APP),
    ...CountryModule.controllers(ENUM_APP_API_TYPE.APP),
    ...DistrictModule.controllers(ENUM_APP_API_TYPE.APP),
    ...TierModule.controllers(ENUM_APP_API_TYPE.APP),
    ...CartModule.controllers(ENUM_APP_API_TYPE.APP),
    ...InvoiceModule.controllers(ENUM_APP_API_TYPE.APP),
    ...PointHistoryModule.controllers(ENUM_APP_API_TYPE.APP),
    ...ProductHistoryModule.controllers(ENUM_APP_API_TYPE.APP),
    ...MediaModule.controllers(ENUM_APP_API_TYPE.APP),
    ...ProductModule.controllers(ENUM_APP_API_TYPE.APP),
    ...ProductBrandModule.controllers(ENUM_APP_API_TYPE.APP),
    ...ProductCategoryModule.controllers(ENUM_APP_API_TYPE.APP),
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
