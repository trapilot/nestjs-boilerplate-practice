import { DynamicModule, Module, Scope } from '@nestjs/common'
import { REQUEST } from '@nestjs/core'
import { AsyncLocalStorage } from 'async_hooks'
import { IContextPayload } from 'lib/nest-core'
import { PRISMA_TENANT_TOKEN } from './constants'
import { PrismaManager, PrismaService } from './services'

@Module({})
export class NestPrismaModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: NestPrismaModule,
      providers: [
        {
          provide: AsyncLocalStorage,
          useValue: new AsyncLocalStorage(),
        },
        {
          provide: PRISMA_TENANT_TOKEN,
          scope: Scope.REQUEST,
          durable: true, // Makes this provider durable
          useFactory: (ctxPayload: IContextPayload, manager: PrismaManager) => {
            /*
              The tenantId in the context payload registered
              in the AggregateByTenantContextIdStrategy
            */
            return manager.getClient(ctxPayload.tenantId)
          },
          inject: [REQUEST, PrismaManager],
        },
        PrismaService,
        PrismaManager,
      ],
      exports: [PrismaService, PRISMA_TENANT_TOKEN],
      imports: [],
    }
  }
}
