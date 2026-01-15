import {
  DynamicModule,
  Inject,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
  Type,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { ServeStaticModule } from '@nestjs/serve-static'
import { ThrottlerGuard, ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler'
import {
  FileUtil,
  IModuleController,
  IModuleExport,
  IModuleImport,
  IModuleProvider,
  LoggerFactory,
} from 'lib/nest-core'
import { collectDefaultMetrics, Registry } from 'prom-client'
import { REQUEST_LOGGER_OPTIONS, REQUEST_METRICS_OPTIONS } from './constants'
import { HealthController, MetricsController } from './controllers'
import { HttpExceptionFilter } from './filters'
import { RequestContextInterceptor } from './interceptors'
import { IRequestLoggerOptions, IRequestMetricsOptions } from './interfaces'
import {
  RequestBodyParserMiddleware,
  RequestContextMiddleware,
  RequestCorsMiddleware,
  RequestPerformanceMiddleware,
  RequestSecurityMiddleware,
} from './middlewares'
import { MetricsService, ReporterService } from './services'
import {
  AgeGreaterThanEqualConstraint,
  DateGreaterThanConstraint,
  DateGreaterThanEqualConstraint,
  DateLessThanConstraint,
  DateLessThanEqualConstraint,
  IsDurationConstraint,
  IsEmailConstraint,
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

@Module({})
export class NestWebModule implements NestModule {
  constructor(
    @Inject(REQUEST_LOGGER_OPTIONS) private readonly loggerOptions: IRequestLoggerOptions,
    private readonly loggerFactory: LoggerFactory,
  ) {}

  private static middlewareConfig?: (consumer: MiddlewareConsumer) => void

  static forRoot(options: {
    admin: boolean
    logger: IRequestLoggerOptions
    metrics: IRequestMetricsOptions
    validator: ValidationPipeOptions
    middleware: { imports: any[]; configure?: (consumer: MiddlewareConsumer) => void }
  }): DynamicModule {
    const imports: IModuleImport[] = []
    const exports: IModuleExport[] = []
    const providers: IModuleProvider[] = []
    const controllers: IModuleController[] = [HealthController]

    if (options.admin) {
      imports.push(
        ServeStaticModule.forRoot({
          rootPath: FileUtil.joinRoot(['public', 'admin']),
          serveRoot: '/admin',
        }),
      )
    }

    if (options.middleware) {
      NestWebModule.middlewareConfig = options.middleware?.configure
      if (options.middleware.imports) {
        imports.push(...options.middleware.imports)
      }
    }

    if (options.logger) {
      providers.push({
        provide: REQUEST_LOGGER_OPTIONS,
        useValue: options.logger,
      })
    }

    if (options.metrics) {
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
        {
          provide: Registry,
          useValue: registry,
        },
        {
          provide: REQUEST_METRICS_OPTIONS,
          useValue: options.metrics,
        },
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
        IsEmailConstraint,
        IsPhoneConstraint,
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
        ThrottlerModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService): ThrottlerModuleOptions => [
            {
              ttl: config.get<number>('request.throttle.ttl'),
              limit: config.get<number>('request.throttle.limit'),
            },
          ],
        }),
      ],
      exports,
      controllers,
    }
  }

  configure(consumer: MiddlewareConsumer): void {
    // Middleware add context
    consumer.apply(RequestContextMiddleware).forRoutes('*')

    // Middleware add logger
    if (this.loggerOptions.autoLogging) {
      const excludeRoutes = this.loggerOptions.excludeRoutes
      const applyRoutes = this.loggerOptions.applyRoutes
      const allRoutes = [{ path: '*', method: RequestMethod.ALL }]

      excludeRoutes
        ? consumer
            .apply(this.loggerFactory.createHttpPino())
            .exclude(...excludeRoutes)
            .forRoutes(...(applyRoutes || allRoutes))
        : consumer
            .apply(this.loggerFactory.createHttpPino())
            .forRoutes(...(applyRoutes || allRoutes))
    }

    // Default middleware (core-defined)
    consumer
      .apply(
        RequestCorsMiddleware,
        RequestSecurityMiddleware,
        RequestPerformanceMiddleware,
        RequestBodyParserMiddleware,
      )
      .forRoutes('*')

    // Custom middleware (user-defined)
    if (NestWebModule.middlewareConfig) {
      NestWebModule.middlewareConfig(consumer)
    }
  }
}
