import { DynamicModule, Module } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'
import { PRISMA_OPTIONS } from './constants'
import { PrismaFilter } from './filters'
import { IPrismaModuleOptions } from './interfaces'
import { PrismaService } from './services'

@Module({})
export class NestPrismaModule {
  static forRoot(options: IPrismaModuleOptions): DynamicModule {
    return {
      global: true,
      module: NestPrismaModule,
      providers: [
        {
          provide: PRISMA_OPTIONS,
          useValue: options,
        },
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
