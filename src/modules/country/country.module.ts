import { Module } from '@nestjs/common'
import { ENUM_APP_API_TYPE, ModuleBase } from 'lib/nest-core'
import { CountryAdminController, CountryAppController } from './controllers'
import { CountryService } from './services'

@Module({
  providers: [CountryService],
  exports: [CountryService],
  imports: [],
})
export class CountryModule extends ModuleBase {
  static _controllers = {
    [ENUM_APP_API_TYPE.CMS]: [CountryAdminController],
    [ENUM_APP_API_TYPE.APP]: [CountryAppController],
  }
}
