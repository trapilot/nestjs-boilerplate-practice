import { HttpStatus, MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common'
import { DataMockModule } from 'app/data'
import { EnumAuthAbilityAction, EnumAuthAbilitySubject } from 'app/enums'
import { UserAbilityFactory } from 'app/helpers'
import { RoutesAdminModule, RoutesAppModule, RoutesPublicModule, RoutesWebModule } from 'app/routes'
import { ValidationError } from 'class-validator'
import { NestAuthModule } from 'lib/nest-auth'
import {
  APP_ENV,
  APP_NAME,
  ENV_CONFIG,
  EnumRoutePath,
  NestCoreModule,
  StrUtil,
} from 'lib/nest-core'
import {
  NestPrismaModule,
  PrismaQueueConsumer,
  PrismaQueueProducer,
  PrismaQueueScanner,
} from 'lib/nest-prisma'
import { NestWebModule, ValidateException } from 'lib/nest-web'
import { AppVersionCheckMiddleware, AppVersionModule } from 'modules/app-version'
import { InvoiceModule, InvoiceRejectOverDueHandler, InvoiceScheduler } from 'modules/invoice'
import {
  MemberEarnHighestPurchaseHandler,
  MemberEarnPointFromPurchaseHandler,
  MemberModule,
  MemberReleaseExpiryPointHandler,
  MemberResetBirthPurchaseHandler,
  MemberResetExpiryPointHandler,
  MemberResetExpiryTierHandler,
  MemberScheduler,
} from 'modules/member'
import {
  NotificationDispatchPushHandler,
  NotificationModule,
  NotificationScheduler,
  NotificationSendPushHandler,
} from 'modules/notification'
import { SettingCheckMaintenanceMiddleware, SettingModule } from 'modules/setting'
import configs from '../configs'

@Module({
  imports: [
    NestCoreModule.forRoot({
      configs,
      cache: true,
      envFilePath: ENV_CONFIG,
    }),
    NestAuthModule.forRoot({
      abilityFactory: UserAbilityFactory,
      subjects: EnumAuthAbilitySubject,
      actions: EnumAuthAbilityAction,
    }),
    NestPrismaModule.forRoot({
      multiTenant: StrUtil.isTrue(process.env.MULTITENANT_ENABLE),
      replication: false,
      debug: StrUtil.isTrue(process.env.DATABASE_DEBUG),
    }),
    NestWebModule.forRoot({
      metrics: {
        defaultMetricsEnabled: false, // disable metrics
        defaultLabels: {
          app: APP_NAME,
          environment: APP_ENV,
        },
      },
      router: {
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
          exceptionFactory: async (errors: ValidationError[]) => new ValidateException(errors),
        },
        logger: {
          autoLogging: StrUtil.isTrue(process.env.HTTP_DEBUG, true),
          excludeRoutes: [
            { path: '*', method: RequestMethod.OPTIONS },
            { path: 'audit/*spat', method: RequestMethod.ALL },
            { path: 'v:version/audit/*spat', method: RequestMethod.ALL },
          ],
        },
        middleware: (consumer: MiddlewareConsumer) => {
          consumer
            .apply(SettingCheckMaintenanceMiddleware)
            .exclude(
              { path: 'admin/auth/login', method: RequestMethod.POST },
              { path: 'admin/auth/refresh', method: RequestMethod.POST },
              { path: 'admin/settings', method: RequestMethod.ALL },
              { path: 'admin/settings/:splat', method: RequestMethod.ALL },
            )
            .forRoutes('*')

          consumer
            .apply(AppVersionCheckMiddleware)
            .forRoutes(
              { path: 'app/*spat', method: RequestMethod.ALL },
              { path: 'v:version/app/*spat', method: RequestMethod.ALL },
              { path: 'web/*spat', method: RequestMethod.ALL },
              { path: 'v:version/web/*spat', method: RequestMethod.ALL },
            )
        },
        routes: [
          { path: EnumRoutePath.CMS, module: RoutesAdminModule },
          { path: EnumRoutePath.APP, module: RoutesAppModule },
          { path: EnumRoutePath.WEB, module: RoutesWebModule },
          { path: EnumRoutePath.PUB, module: RoutesPublicModule },
        ],
      },
      worker: {
        producer: PrismaQueueProducer,
        consumer: PrismaQueueConsumer,
        scanner: PrismaQueueScanner,
        handlers: [
          MemberEarnHighestPurchaseHandler,
          MemberEarnPointFromPurchaseHandler,
          MemberReleaseExpiryPointHandler,
          MemberResetBirthPurchaseHandler,
          MemberResetExpiryPointHandler,
          MemberResetExpiryTierHandler,
          NotificationDispatchPushHandler,
          NotificationSendPushHandler,
          InvoiceRejectOverDueHandler,
        ],
        schedulers: [NotificationScheduler, MemberScheduler, InvoiceScheduler],
      },
      imports: [SettingModule, AppVersionModule, MemberModule, NotificationModule, InvoiceModule],
    }),

    DataMockModule, // NOTE: remove before make a new build, it's used to fake user's behavior
  ],
})
export class AppModule {}
