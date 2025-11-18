import { HttpStatus, MiddlewareConsumer, Module } from '@nestjs/common'
import { ValidationError } from 'class-validator'
import { NestAuthModule } from 'lib/nest-auth'
import { APP_ENV, APP_NAME, NestCoreModule } from 'lib/nest-core'
import { NestPrismaModule } from 'lib/nest-prisma'
import { EntityValidateException, NestWebModule } from 'lib/nest-web'
import { AppVersionMiddleware, AppVersionModule } from 'src/modules/app-version'
import { SettingMaintenanceMiddleware, SettingModule } from 'src/modules/setting'
import configs from '../configs'
import { RouterModule } from './router'
import { WorkerModule } from './worker'

@Module({
  controllers: [],
  imports: [
    // Library
    NestCoreModule.forRoot({ configs, envFilePath: ['.env'] }),
    NestPrismaModule.forRoot(),
    NestAuthModule.forRoot(),
    NestWebModule.forRoot({
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
      middleware: {
        imports: [SettingModule, AppVersionModule],
        configure: (consumer: MiddlewareConsumer) => {
          AppVersionMiddleware.configure(consumer)
          SettingMaintenanceMiddleware.configure(consumer)
        },
      },
    }),

    // Routes
    WorkerModule.register(),
    RouterModule.register({ http: true }),
  ],
})
export class AppModule {}
