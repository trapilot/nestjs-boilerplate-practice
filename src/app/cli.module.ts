import { Module } from '@nestjs/common'
import { DataSeedModule } from 'app/data'
import { EnumAuthAbilityAction, EnumAuthAbilitySubject } from 'app/enums'
import { UserAbilityFactory } from 'app/helpers'
import { PermissionSeed } from 'app/seeds'
import { NestAuthModule } from 'lib/nest-auth'
import { ENV_CONFIG, NestCoreModule } from 'lib/nest-core'
import { NestPrismaModule } from 'lib/nest-prisma'
import configs from '../configs'

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
