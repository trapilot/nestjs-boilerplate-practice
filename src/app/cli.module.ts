import { Module } from '@nestjs/common'
import { NestCoreModule } from 'lib/nest-core'
import { NestPrismaModule } from 'lib/nest-prisma'
import { SharedModule } from 'shared/shared.module'
import configs from '../configs'
import { RouterModule } from './router'

@Module({
  imports: [
    // Library
    NestCoreModule.forRoot({ configs, envFilePath: ['.env'] }),
    NestPrismaModule.forRoot(),

    // App Register
    SharedModule.register(),
    RouterModule.register({ cli: true }),
  ],
})
export class CliModule {}
