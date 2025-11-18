import { Module } from '@nestjs/common'
import { NestCoreModule } from 'lib/nest-core'
import { NestPrismaModule } from 'lib/nest-prisma'
import configs from '../configs'
import { RouterModule } from './router'

@Module({
  imports: [
    // Library
    NestCoreModule.forRoot({ configs, envFilePath: ['.env'] }),
    NestPrismaModule.forRoot(),

    // Routes
    RouterModule.register({ cli: true }),
  ],
})
export class CliModule {}
