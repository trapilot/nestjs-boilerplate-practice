import { Module } from '@nestjs/common'
import { ENUM_APP_CMD_TYPE } from 'lib/nest-core'
import { PermissionModule } from 'modules/permission'
import { RoleModule } from 'modules/role'

@Module({
  providers: [
    ...RoleModule.commands(ENUM_APP_CMD_TYPE.MIGRATE),
    ...PermissionModule.commands(ENUM_APP_CMD_TYPE.MIGRATE),
  ],
  imports: [RoleModule, PermissionModule],
})
export class CommandsMigrateModule {}
