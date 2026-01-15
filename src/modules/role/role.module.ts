import { Module } from '@nestjs/common'
import { PermissionModule } from 'modules/permission'
import { RoleService } from './services'

@Module({
  providers: [RoleService],
  exports: [RoleService],
  imports: [PermissionModule],
})
export class RoleModule {}
