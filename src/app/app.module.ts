import { HttpStatus, MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common'
import { ValidationError } from 'class-validator'
import { APP_ENV, APP_NAME, ENV_CONFIG, NestCoreModule, StrUtil } from 'lib/nest-core'
import { NestPrismaModule } from 'lib/nest-prisma'
import { EntityValidateException, NestWebModule } from 'lib/nest-web'
import { AppVersionModule } from 'modules/app-version'
import { SettingModule } from 'modules/setting'
import { SharedModule } from 'shared/shared.module'
import configs from '../configs'
import { MaintenanceCheckMiddleware, VersionCheckMiddleware } from './middleware'
import { RouterModule } from './router'
import { SchedulerModule } from './scheduler'

@Module({
  imports: [
    NestCoreModule.forRoot({
      configs,
      cache: true,
      envFilePath: ENV_CONFIG,
    }),
    NestPrismaModule.forRoot({
      multiTenant: StrUtil.isTrue(process.env.MULTITENANT_ENABLE),
      replication: true,
    }),
    NestWebModule.forRoot({
      admin: true,
      validator: {
        transform: true,
        whitelist: true,
        skipNullProperties: false,
        skipUndefinedProperties: false,
        skipMissingProperties: false,
        forbidUnknownValues: false,
        // stopAtFirstError: false,
        stopAtFirstError: true,
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        exceptionFactory: async (errors: ValidationError[]) => new EntityValidateException(errors),
      },
      metrics: {
        defaultMetricsEnabled: false, // disable metrics
        defaultLabels: {
          app: APP_NAME,
          environment: APP_ENV,
        },
      },
      logger: {
        autoLogging: true,
        excludeRoutes: [
          { path: '*', method: RequestMethod.OPTIONS },
          { path: 'audit/*spat', method: RequestMethod.ALL },
          { path: 'v:version/audit/*spat', method: RequestMethod.ALL },
        ],
      },
      middleware: {
        imports: [SettingModule, AppVersionModule],
        configure: (consumer: MiddlewareConsumer) => {
          consumer
            .apply(MaintenanceCheckMiddleware)
            .exclude(
              { path: 'admin/auth/login', method: RequestMethod.POST },
              { path: 'admin/auth/refresh', method: RequestMethod.POST },
              { path: 'admin/settings', method: RequestMethod.ALL },
              { path: 'admin/settings/:splat', method: RequestMethod.ALL }
            )
            .forRoutes('*')

          consumer
            .apply(VersionCheckMiddleware)
            .forRoutes(
              { path: 'app/*spat', method: RequestMethod.ALL },
              { path: 'v:version/app/*spat', method: RequestMethod.ALL },
              { path: 'web/*spat', method: RequestMethod.ALL },
              { path: 'v:version/web/*spat', method: RequestMethod.ALL }
            )
        },
      },
    }),

    // App Register
    SharedModule.register(),
    RouterModule.register({ http: true }),
    SchedulerModule.register({ queue: true, task: true }),
  ],
})
export class AppModule {}
