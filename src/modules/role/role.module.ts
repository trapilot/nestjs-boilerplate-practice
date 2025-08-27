import { Module } from '@nestjs/common'
import { RoleService } from './services'

@Module({
  providers: [RoleService],
  exports: [RoleService],
  imports: [],
})
export class RoleModule {}
