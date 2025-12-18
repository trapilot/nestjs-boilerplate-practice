import {
  DynamicModule,
  MiddlewareConsumer,
  Module,
  NestModule,
  Provider,
  Type,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common'
import { Controller, ForwardReference } from '@nestjs/common/interfaces'
import { ConfigService } from '@nestjs/config'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { ServeStaticModule } from '@nestjs/serve-static'
import { ThrottlerGuard, ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler'
import { ROOT_PATH } from 'lib/nest-core'
import { join } from 'path'
import { collectDefaultMetrics, Registry } from 'prom-client'
import { REQUEST_METRICS_CONFIG_TOKEN } from './constants'
import { HealthController, MetricsController } from './controllers'
import { HttpExceptionFilter } from './filters'
import { RequestContextInterceptor } from './interceptors'
import { IRequestMetricsConfig } from './interfaces'
import {
  RequestBodyParserMiddleware,
  RequestCorsMiddleware,
  RequestPerformanceMiddleware,
  RequestSecurityMiddleware,
  RequestUserAgentMiddleware,
} from './middlewares'
import { MetricsService, ReporterService } from './services'
import {
  AgeGreaterThanEqualConstraint,
  DateGreaterThanConstraint,
  DateGreaterThanEqualConstraint,
  DateLessThanConstraint,
  DateLessThanEqualConstraint,
  IsCustomEmailConstraint,
  IsDurationConstraint,
  IsPasswordConstraint,
  IsPhoneConstraint,
  IsRatioConstraint,
  PropertyGreaterThanConstraint,
  PropertyGreaterThanEqualConstraint,
  PropertyLessThanConstraint,
  PropertyLessThanEqualConstraint,
  SafeStringConstraint,
  StartWithConstraint,
} from './validations'

type ModuleImport = Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference
type ModuleExport = DynamicModule | Type<any> | string | symbol | ForwardReference
type ModuleController = Type<Controller>

@Module({})
export class NestWebModule implements NestModule {
  private static middlewareConfig?: (consumer: MiddlewareConsumer) => void

  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(
        RequestCorsMiddleware,
        RequestSecurityMiddleware,
        RequestPerformanceMiddleware,
        RequestBodyParserMiddleware,
        RequestUserAgentMiddleware,
      )
      .forRoutes('*')

    // Custom middleware (user-defined)
    if (NestWebModule.middlewareConfig) {
      NestWebModule.middlewareConfig(consumer)
    }
  }

  static forRoot(options: {
    validator: ValidationPipeOptions
    metrics?: IRequestMetricsConfig
    middleware?: { imports?: any[]; configure: (consumer: MiddlewareConsumer) => void }
  }): DynamicModule {
    const providers: Provider[] = []
    const imports: ModuleImport[] = []
    const exports: ModuleExport[] = []
    const controllers: ModuleController[] = [HealthController]

    if (options.middleware) {
      NestWebModule.middlewareConfig = options.middleware.configure
      if (options.middleware.imports) {
        imports.push(...options.middleware.imports)
      }
    }

    if (options?.metrics?.defaultMetricsEnabled) {
      const registry: Registry = new Registry()

      if (options.metrics.defaultLabels) {
        registry.setDefaultLabels(options.metrics.defaultLabels)
      }

      if (options.metrics.defaultMetricsEnabled) {
        collectDefaultMetrics({ register: registry })
      }

      controllers.push(MetricsController)
      exports.push(ReporterService)
      providers.push(
        { provide: Registry, useValue: registry },
        { provide: REQUEST_METRICS_CONFIG_TOKEN, useValue: options.metrics },
        MetricsService,
        ReporterService,
      )

      if (options.metrics.interceptors) {
        providers.push(
          ...options.metrics.interceptors.map((interceptor) => ({
            provide: APP_INTERCEPTOR,
            useClass: interceptor as Type<any>,
          })),
        )
      }
    }

    return {
      global: true,
      module: NestWebModule,
      providers: [
        ...providers,
        { provide: APP_FILTER, useClass: HttpExceptionFilter },
        { provide: APP_INTERCEPTOR, useClass: RequestContextInterceptor },
        { provide: APP_GUARD, useClass: ThrottlerGuard },
        {
          provide: APP_PIPE,
          useFactory: () => new ValidationPipe(options.validator),
        },

        // constraints
        IsDurationConstraint,
        IsPasswordConstraint,
        IsRatioConstraint,
        IsPhoneConstraint,
        IsCustomEmailConstraint,
        AgeGreaterThanEqualConstraint,
        DateLessThanConstraint,
        DateLessThanEqualConstraint,
        DateGreaterThanConstraint,
        DateGreaterThanEqualConstraint,
        PropertyLessThanConstraint,
        PropertyLessThanEqualConstraint,
        PropertyGreaterThanConstraint,
        PropertyGreaterThanEqualConstraint,
        SafeStringConstraint,
        StartWithConstraint,
      ],
      imports: [
        ...imports,
        ServeStaticModule.forRoot({
          rootPath: join(ROOT_PATH, 'public', 'admin'),
          serveRoot: '/admin',
        }),
        ThrottlerModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService): ThrottlerModuleOptions => [
            {
              ttl: config.get<number>('middleware.throttle.ttl'),
              limit: config.get<number>('middleware.throttle.limit'),
            },
          ],
        }),
      ],
      exports,
      controllers,
    }
  }
}
