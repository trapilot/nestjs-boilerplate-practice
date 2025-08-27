import { DynamicModule, ForwardReference, Module, Type } from '@nestjs/common'
import { RouterModule as NestJsRouterModule } from '@nestjs/core'
import { ENUM_APP_API_ROUTE, NestHelper } from 'lib/nest-core'
import { CommandsMigrateModule, CommandsSeedModule } from './commands'
import { RoutesAdminModule, RoutesAppModule, RoutesPublicModule, RoutesWebModule } from './routes'

@Module({})
export class RouterModule {
  static register(options: { http?: boolean; cli?: boolean }): DynamicModule {
    const imports: (DynamicModule | Type<any> | Promise<DynamicModule> | ForwardReference<any>)[] =
      []

    if (options?.cli) {
      imports.push(CommandsMigrateModule)

      // Does not allow seed data in Production
      if (!NestHelper.isProduction()) {
        imports.push(CommandsSeedModule)
      }
    }

    if (options?.http) {
      imports.push(
        RoutesAdminModule,
        RoutesAppModule,
        RoutesWebModule,
        RoutesPublicModule,
        NestJsRouterModule.register([
          { path: ENUM_APP_API_ROUTE.CMS, module: RoutesAdminModule },
          { path: ENUM_APP_API_ROUTE.APP, module: RoutesAppModule },
          { path: ENUM_APP_API_ROUTE.WEB, module: RoutesWebModule },
          { path: ENUM_APP_API_ROUTE.PUB, module: RoutesPublicModule },
        ]),
      )
    }

    return {
      module: RouterModule,
      imports,
    }
  }
}
