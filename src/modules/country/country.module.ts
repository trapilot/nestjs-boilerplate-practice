import { Module } from '@nestjs/common'
import { ENUM_APP_API_TYPE, ModuleBase } from 'lib/nest-core'
import { CountryAdminController, CountryAppController } from './controllers'
import { CountryService } from './services'
import { HasAllowCountryConstraint, IsAllowCountryConstraint } from './validations'

@Module({
  providers: [CountryService, IsAllowCountryConstraint, HasAllowCountryConstraint],
  exports: [CountryService],
  imports: [],
})
export class CountryModule extends ModuleBase {
  static _controllers = {
    [ENUM_APP_API_TYPE.CMS]: [CountryAdminController],
    [ENUM_APP_API_TYPE.APP]: [CountryAppController],
  }
}
