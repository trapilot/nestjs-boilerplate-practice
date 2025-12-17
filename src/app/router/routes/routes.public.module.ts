import { Module } from '@nestjs/common'
import { ENUM_APP_API_TYPE } from 'lib/nest-core'
import { AuditModule } from 'modules/audit'

@Module({
  controllers: [...AuditModule.controllers(ENUM_APP_API_TYPE.PUB)],
  imports: [AuditModule],
})
export class RoutesPublicModule {}
