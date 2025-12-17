import { Module } from '@nestjs/common'
import { ENUM_APP_API_TYPE, ENUM_APP_CMD_TYPE, ModuleBase } from 'lib/nest-core'
import { ProductSeedCommand } from './commands'
import { ProductAdminController, ProductAppController } from './controllers'
import { ProductService } from './services'

@Module({
  providers: [ProductService],
  exports: [ProductService],
  imports: [],
})
export class ProductModule extends ModuleBase {
  static _controllers = {
    [ENUM_APP_API_TYPE.CMS]: [ProductAdminController],
    [ENUM_APP_API_TYPE.APP]: [ProductAppController],
  }
  static _commands = {
    [ENUM_APP_CMD_TYPE.SEED]: [ProductSeedCommand],
  }
}
