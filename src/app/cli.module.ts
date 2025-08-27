import { Module } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'
import { NestCoreModule } from 'lib/nest-core'
import { NestPrismaModule, PrismaFilter } from 'lib/nest-prisma'
import { GeneralFilter } from 'lib/nest-web'
import configs from '../configs'
import { RouterModule } from './router'

@Module({
  providers: [
    { provide: APP_FILTER, useClass: GeneralFilter },
    { provide: APP_FILTER, useClass: PrismaFilter },
  ],
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
