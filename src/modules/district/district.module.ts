import { Module } from '@nestjs/common'
import { ENUM_APP_API_TYPE, ModuleBase } from 'lib/nest-core'
import { DistrictAdminController, DistrictAppController } from './controllers'
import { DistrictService } from './services'

@Module({
  providers: [DistrictService],
  exports: [DistrictService],
  imports: [],
})
export class DistrictModule extends ModuleBase {
  static _controllers = {
    [ENUM_APP_API_TYPE.CMS]: [DistrictAdminController],
    [ENUM_APP_API_TYPE.APP]: [DistrictAppController],
  }
}
