import { Module } from '@nestjs/common'
import { PointSchemaModule } from 'modules/point-schema/point-schema.module'
import { TierModule } from 'modules/tier/tier.module'
import { MemberPointService } from './services/member-point.service'

@Module({
  providers: [MemberPointService],
  exports: [MemberPointService],
  imports: [TierModule, PointSchemaModule],
})
export class MemberPointModule {}
