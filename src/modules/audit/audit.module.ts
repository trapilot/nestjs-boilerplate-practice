import { Module } from '@nestjs/common'
import { AuditService } from './services'

@Module({
  providers: [AuditService],
  exports: [AuditService],
  imports: [],
})
export class AuditModule {}
