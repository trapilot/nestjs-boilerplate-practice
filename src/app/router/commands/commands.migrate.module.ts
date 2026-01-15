import { Module } from '@nestjs/common'
import { PermissionMigrateCommand, PermissionModule } from 'modules/permission'
import { RoleMigrateCommand, RoleModule } from 'modules/role'

@Module({
  providers: [PermissionMigrateCommand, RoleMigrateCommand],
  imports: [PermissionModule, RoleModule],
})
export class CommandsMigrateModule {}
