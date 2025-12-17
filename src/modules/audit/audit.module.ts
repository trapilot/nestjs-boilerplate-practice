import { Module } from '@nestjs/common'
import { ENUM_APP_API_TYPE, ModuleBase } from 'lib/nest-core'
import { AuditPublicController } from './controllers'
import { AuditService } from './services'

@Module({
  providers: [AuditService],
  exports: [AuditService],
  imports: [],
})
export class AuditModule extends ModuleBase {
  static _controllers = {
    [ENUM_APP_API_TYPE.PUB]: [AuditPublicController],
  }
}
