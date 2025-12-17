import { Module } from '@nestjs/common'
import { ENUM_APP_CMD_TYPE } from 'lib/nest-core'
import { RoleModule } from 'modules/role'

@Module({
  providers: [...RoleModule.commands(ENUM_APP_CMD_TYPE.MIGRATE)],
  imports: [RoleModule],
})
export class CommandsMigrateModule {}
