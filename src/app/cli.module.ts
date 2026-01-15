import { Module } from '@nestjs/common'
import { ENV_CONFIG, NestCoreModule } from 'lib/nest-core'
import { NestPrismaModule } from 'lib/nest-prisma'
import { SharedModule } from 'shared/shared.module'
import configs from '../configs'
import { RouterModule } from './router'

@Module({
  imports: [
    NestCoreModule.forRoot({
      configs,
      cache: false,
      envFilePath: ENV_CONFIG,
    }),
    NestPrismaModule.forRoot({
      multiTenant: false,
      replication: false,
    }),

    // App Register
    SharedModule.register(),
    RouterModule.register({ cli: true }),
  ],
})
export class CliModule {}
