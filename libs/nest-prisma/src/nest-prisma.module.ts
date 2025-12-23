import { DynamicModule, Module } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'
import { PrismaFilter } from './filters'
import { PrismaService } from './services'

@Module({})
export class NestPrismaModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: NestPrismaModule,
      providers: [
        {
          provide: APP_FILTER,
          useClass: PrismaFilter,
        },
        PrismaService,
      ],
      exports: [PrismaService],
    }
  }
}
