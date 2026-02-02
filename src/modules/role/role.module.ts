import { Module } from '@nestjs/common'
import { PermissionModule } from 'modules/permission/permission.module'
import { RoleService } from './services/role.service'

@Module({
  providers: [RoleService],
  exports: [RoleService],
  imports: [PermissionModule],
})
export class RoleModule {}
