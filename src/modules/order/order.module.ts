import { Module } from '@nestjs/common'
import { ENUM_APP_API_TYPE, ModuleBase } from 'lib/nest-core'
import { OrderAdminController } from './controllers'
import { OrderService } from './services'

@Module({
  providers: [OrderService],
  exports: [OrderService],
  imports: [],
})
export class OrderModule extends ModuleBase {
  static _controllers = {
    [ENUM_APP_API_TYPE.CMS]: [OrderAdminController],
  }
}
