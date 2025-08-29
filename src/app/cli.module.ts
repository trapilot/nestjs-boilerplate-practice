import { Module } from '@nestjs/common'
import { NestCoreModule } from 'lib/nest-core'
import { NestPrismaModule } from 'lib/nest-prisma'
import configs from '../configs'
import { RouterModule } from './router'

@Module({
  imports: [
    // Library
    NestPrismaModule.forRoot(),
    NestCoreModule.forRoot({
      config: {
        isGlobal: true,
        expandVariables: true,
        envFilePath: ['.env'],
        load: configs,
      },
      cache: { isGlobal: true },
    }),

    // Application
    RouterModule.register({ cli: true }),
  ],
})
export class CliModule {}
