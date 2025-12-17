import { Module } from '@nestjs/common'
import { ENUM_APP_API_TYPE, ModuleBase } from 'lib/nest-core'
import { ProductHistoryAdminController, ProductHistoryAppController } from './controllers'
import { ProductHistoryService } from './services'

@Module({
  providers: [ProductHistoryService],
  exports: [ProductHistoryService],
  imports: [],
})
export class ProductHistoryModule extends ModuleBase {
  static _controllers = {
    [ENUM_APP_API_TYPE.CMS]: [ProductHistoryAdminController],
    [ENUM_APP_API_TYPE.APP]: [ProductHistoryAppController],
  }
}
