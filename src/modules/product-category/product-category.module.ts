import { Module } from '@nestjs/common'
import { ENUM_APP_API_TYPE, ModuleBase } from 'lib/nest-core'
import { ProductCategoryAdminController, ProductCategoryAppController } from './controllers'
import { ProductCategoryService } from './services'

@Module({
  providers: [ProductCategoryService],
  exports: [ProductCategoryService],
  imports: [],
})
export class ProductCategoryModule extends ModuleBase {
  static _controllers = {
    [ENUM_APP_API_TYPE.CMS]: [ProductCategoryAdminController],
    [ENUM_APP_API_TYPE.APP]: [ProductCategoryAppController],
  }
}
