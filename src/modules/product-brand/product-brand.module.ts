import { Module } from '@nestjs/common'
import { ENUM_APP_API_TYPE, ModuleBase } from 'lib/nest-core'
import { ProductBrandAdminController, ProductBrandAppController } from './controllers'
import { ProductBrandService } from './services'

@Module({
  providers: [ProductBrandService],
  exports: [ProductBrandService],
  imports: [],
})
export class ProductBrandModule extends ModuleBase {
  static _controllers = {
    [ENUM_APP_API_TYPE.CMS]: [ProductBrandAdminController],
    [ENUM_APP_API_TYPE.APP]: [ProductBrandAppController],
  }
}
