import { Module } from '@nestjs/common'
import { NestAuthModule } from 'lib/nest-auth'
import { ENV_CONFIG, NestCoreModule } from 'lib/nest-core'
import { NestPrismaModule } from 'lib/nest-prisma'
import configs from '../configs'
import { DataSeedModule } from './data/data.seed.module'
import { EnumAuthAbilityAction, EnumAuthAbilitySubject } from './enums/user.enum'
import { UserAbilityFactory } from './helpers/user.ability.factory'
import { PermissionSeed } from './seeds/permission.seed'

@Module({
  imports: [
    NestCoreModule.forRoot({
      configs,
      cache: false,
      envFilePath: ENV_CONFIG,
    }),
    NestAuthModule.forRoot({
      abilityFactory: UserAbilityFactory,
      subjects: EnumAuthAbilitySubject,
      actions: EnumAuthAbilityAction,
    }),
    NestPrismaModule.forRoot({
      multiTenant: false,
      replication: false,
      debug: false,
    }),

    DataSeedModule, // NOTE: remove before make a new build, it's used to initialize data
  ],
  providers: [PermissionSeed],
})
export class CliModule {}
