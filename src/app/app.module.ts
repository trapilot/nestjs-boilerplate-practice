import { HttpStatus, Module, RequestMethod } from '@nestjs/common'
import { ValidationError } from 'class-validator'
import { NestAuthModule } from 'lib/nest-auth'
import {
  APP_ENV,
  APP_NAME,
  ENV_CONFIG,
  EnumAppEnvironment,
  EnumRoutePath,
  NestCoreModule,
  StrUtil,
} from 'lib/nest-core'
import {
  NestPrismaModule,
  PrismaWorkerConsumer,
  PrismaWorkerProducer,
  PrismaWorkerScanner,
} from 'lib/nest-prisma'
import { NestWebModule, ValidateException } from 'lib/nest-web'
import { AppVersionModule } from 'modules/app-version/app-version.module'
import { AppVersionCheckMiddleware } from 'modules/app-version/middleware/app-version.check.middleware'
import { InvoiceProcEarnPointsHandler } from 'modules/invoice/handlers/invoice.proc-earn-points'
import { InvoiceProcOverDueHandler } from 'modules/invoice/handlers/invoice.proc-over-due'
import { InvoiceScanEarnPointsHandler } from 'modules/invoice/handlers/invoice.scan-earn-points.handler'
import { InvoiceScanOverDueHandler } from 'modules/invoice/handlers/invoice.scan-over-due.handler'
import { InvoiceModule } from 'modules/invoice/invoice.module'
import { MemberEarnPointFromPurchaseHandler } from 'modules/member/handlers/member.earn-point-from-purchases.handler'
import { MemberEmailWelcomeHandler } from 'modules/member/handlers/member.email-welcome.handler'
import { MemberGenerateCodeHandler } from 'modules/member/handlers/member.generate-code.handler'
import { MemberGrantTierRewardHandler } from 'modules/member/handlers/member.grant-tier-reward.handler'
import { MemberProcessExpiredHandler } from 'modules/member/handlers/member.process-expired.handler'
import { MemberProcessReleasePointsHandler } from 'modules/member/handlers/member.process-release-points.handler'
import { MemberScanExpiredHandler } from 'modules/member/handlers/member.scan-expired.handler'
import { MemberScanPendingPointHandler } from 'modules/member/handlers/member.scan-pending-points.handler'
import { MemberModule } from 'modules/member/member.module'
import { NotificationDispatchPushHandler } from 'modules/notification/handlers/notification.dispatch-push.handler'
import { NotificationSendPushHandler } from 'modules/notification/handlers/notification.send-notification.handler'
import { NotificationModule } from 'modules/notification/notification.module'
import { SettingCheckMaintenanceMiddleware } from 'modules/setting/middleware/setting.check-maintenance.middleware'
import { SettingModule } from 'modules/setting/setting.module'
import configs from '../configs'
import { DataMockModule } from './data/data.mock.module'
import { EnumAuthAbilityAction, EnumAuthAbilitySubject } from './enums/user.enum'
import { UserAbilityFactory } from './helpers/user.ability.factory'
import { RoutesAdminModule } from './routes/routes.admin.module'
import { RoutesAppModule } from './routes/routes.app.module'
import { RoutesPublicModule } from './routes/routes.public.module'
import { RoutesWebModule } from './routes/routes.web.module'

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
      multiTenant: StrUtil.isTrue(process.env.APP_TENANT),
      replication: StrUtil.isTrue(process.env.DATABASE_REPLICATION),
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
        enabled: StrUtil.isTrue(process.env.APP_ROUTER),
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
          autoLogging: StrUtil.isNot(process.env.APP_ENV, EnumAppEnvironment.DEVELOPMENT),
          excludeRoutes: [
            { path: '*', method: RequestMethod.OPTIONS },
            { path: 'audit/*spat', method: RequestMethod.ALL },
            { path: 'v:version/audit/*spat', method: RequestMethod.ALL },
          ],
        },
        middlewares: [
          {
            middleware: SettingCheckMaintenanceMiddleware,
            module: SettingModule,
            excludeRoutes: [
              { path: 'admin/auth/login', method: RequestMethod.POST },
              { path: 'admin/auth/refresh', method: RequestMethod.POST },
              { path: 'admin/settings', method: RequestMethod.ALL },
              { path: 'admin/settings/:splat', method: RequestMethod.ALL },
            ],
          },
          {
            middleware: AppVersionCheckMiddleware,
            module: AppVersionModule,
            applyRoutes: [
              { path: 'app/*spat', method: RequestMethod.ALL },
              { path: 'v:version/app/*spat', method: RequestMethod.ALL },
              { path: 'web/*spat', method: RequestMethod.ALL },
              { path: 'v:version/web/*spat', method: RequestMethod.ALL },
            ],
          },
        ],
        routes: [
          { path: EnumRoutePath.CMS, module: RoutesAdminModule },
          { path: EnumRoutePath.APP, module: RoutesAppModule },
          { path: EnumRoutePath.WEB, module: RoutesWebModule },
          { path: EnumRoutePath.PUB, module: RoutesPublicModule },
        ],
      },
      worker: {
        enabled: StrUtil.isTrue(process.env.APP_WORKER),
        config: {
          concurrency: 50,
          pollIntervalMs: 2000,
          archiveIntervalMs: 10000,
          recoveryIntervalMs: 10000,
        },
        producer: PrismaWorkerProducer,
        consumer: PrismaWorkerConsumer,
        scanner: PrismaWorkerScanner,
        modules: [
          {
            module: MemberModule,
            handlers: [
              MemberScanExpiredHandler,
              MemberScanPendingPointHandler,
              MemberProcessReleasePointsHandler,
              MemberProcessExpiredHandler,
              MemberEarnPointFromPurchaseHandler,
              MemberGenerateCodeHandler,
              MemberGrantTierRewardHandler,
              MemberEmailWelcomeHandler,
            ],
          },
          {
            module: NotificationModule,
            handlers: [NotificationDispatchPushHandler, NotificationSendPushHandler],
          },
          {
            module: InvoiceModule,
            handlers: [
              InvoiceScanEarnPointsHandler,
              InvoiceScanOverDueHandler,
              InvoiceProcEarnPointsHandler,
              InvoiceProcOverDueHandler,
            ],
          },
        ],
      },
    }),

    DataMockModule, // NOTE: remove before make a new build, it's used to fake user's behavior
  ],
})
export class AppModule {}
