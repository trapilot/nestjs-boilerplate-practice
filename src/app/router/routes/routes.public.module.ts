import { Module } from '@nestjs/common'
import { AuditModule, AuditPublicController } from 'modules/audit'

@Module({
  controllers: [AuditPublicController],
  imports: [AuditModule],
})
export class RoutesPublicModule {}
