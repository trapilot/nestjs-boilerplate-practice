import { Module } from '@nestjs/common'
import { AuditService } from './services/audit.service'

@Module({
  providers: [AuditService],
  exports: [AuditService],
  imports: [],
})
export class AuditModule {}
