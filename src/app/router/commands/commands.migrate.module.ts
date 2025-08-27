import { Module } from '@nestjs/common'
import { ProductModule } from 'src/modules/product'
import { RoleMigrateCommand, RoleModule } from 'src/modules/role'

@Module({
  providers: [RoleMigrateCommand],
  imports: [RoleModule, ProductModule],
})
export class CommandsMigrateModule {}
