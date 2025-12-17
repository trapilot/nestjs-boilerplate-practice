import { Module } from '@nestjs/common'
import { ENUM_APP_API_TYPE, ModuleBase } from 'lib/nest-core'
import { MediaAdminController, MediaAppController } from './controllers'
import { MediaService } from './services'

@Module({
  providers: [MediaService],
  exports: [MediaService],
  imports: [],
})
export class MediaModule extends ModuleBase {
  static _controllers = {
    [ENUM_APP_API_TYPE.CMS]: [MediaAdminController],
    [ENUM_APP_API_TYPE.APP]: [MediaAppController],
  }
}
