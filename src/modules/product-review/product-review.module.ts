import { Module } from '@nestjs/common'
import { ENUM_APP_API_TYPE, ModuleBase } from 'lib/nest-core'
import { ProductReviewAdminController } from './controllers'
import { ProductReviewService } from './services'

@Module({
  providers: [ProductReviewService],
  exports: [ProductReviewService],
  imports: [],
})
export class ProductReviewModule extends ModuleBase {
  static _controllers = {
    [ENUM_APP_API_TYPE.CMS]: [ProductReviewAdminController],
  }
}
