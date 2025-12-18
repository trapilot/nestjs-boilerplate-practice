import { Module } from '@nestjs/common'
import { ENUM_APP_API_TYPE, ENUM_APP_CMD_TYPE, ModuleBase } from 'lib/nest-core'
import { MemberModule } from 'modules/member'
import { OrderModule } from 'modules/order'
import { CartSeedCommand } from './commands'
import { CartAdminController, CartAppController } from './controllers'
import { CartListener } from './listeners'
import { CartService } from './services'

@Module({
  providers: [CartListener, CartService],
  exports: [CartService],
  imports: [MemberModule, OrderModule],
})
export class CartModule extends ModuleBase {
  static _controllers = {
    [ENUM_APP_API_TYPE.CMS]: [CartAdminController],
    [ENUM_APP_API_TYPE.APP]: [CartAppController],
  }
  static _commands = {
    [ENUM_APP_CMD_TYPE.SEED]: [CartSeedCommand],
  }
}
