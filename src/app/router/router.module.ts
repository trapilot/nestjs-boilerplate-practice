import { DynamicModule, Module } from '@nestjs/common'
import { RouterModule as NestJsRouterModule } from '@nestjs/core'
import { AppUtil, EnumRoutePath, IModuleImport, IModuleRouterOptions } from 'lib/nest-core'
import { CommandsMigrateModule, CommandsSeedModule } from './commands'
import { RoutesAdminModule, RoutesAppModule, RoutesPublicModule, RoutesWebModule } from './routes'

@Module({})
export class RouterModule {
  static register(options: IModuleRouterOptions): DynamicModule {
    const imports: IModuleImport[] = []

    if (options?.cli) {
      imports.push(CommandsMigrateModule)

      // Don't seed data in Live/Production
      if (!AppUtil.isLive()) {
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
          { path: EnumRoutePath.CMS, module: RoutesAdminModule },
          { path: EnumRoutePath.APP, module: RoutesAppModule },
          { path: EnumRoutePath.WEB, module: RoutesWebModule },
          { path: EnumRoutePath.PUB, module: RoutesPublicModule },
        ]),
      )
    }

    return {
      module: RouterModule,
      imports,
    }
  }
}
