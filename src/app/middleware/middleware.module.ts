import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common'
import { AppVersionMiddleware, AppVersionModule } from 'src/modules/app-version'
import { SettingMaintenanceMiddleware, SettingModule } from 'src/modules/setting'

@Module({
  exports: [],
  providers: [],
  imports: [SettingModule, AppVersionModule],
})
export class MiddlewareModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(AppVersionMiddleware)
      .forRoutes(
        { path: 'app/*spat', method: RequestMethod.ALL },
        { path: 'v:version/app/*spat', method: RequestMethod.ALL },
        { path: 'web/*spat', method: RequestMethod.ALL },
        { path: 'v:version/web/*spat', method: RequestMethod.ALL },
      )
    consumer
      .apply(SettingMaintenanceMiddleware)
      .exclude(
        { path: 'admin/auth/login', method: RequestMethod.POST },
        { path: 'admin/auth/refresh', method: RequestMethod.POST },
        { path: 'admin/settings', method: RequestMethod.ALL },
        { path: 'admin/settings/:splat', method: RequestMethod.ALL },
      )
      .forRoutes('*')
  }
}
