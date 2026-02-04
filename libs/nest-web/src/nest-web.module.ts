import {
  BeforeApplicationShutdown,
  DynamicModule,
  Inject,
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  OnApplicationBootstrap,
  Optional,
  RequestMethod,
  Type,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  APP_FILTER,
  APP_GUARD,
  APP_INTERCEPTOR,
  APP_PIPE,
  ModuleRef,
  RouterModule,
  Routes,
} from '@nestjs/core'
import { ServeStaticModule } from '@nestjs/serve-static'
import { ThrottlerGuard, ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler'
import {
  FileUtil,
  IModuleController,
  IModuleExport,
  IModuleImport,
  IModuleProvider,
  IQueueConsumer,
  IQueueHandler,
  IQueueProducer,
  IQueueScanner,
  LoggerFactory,
  QueueConsumer,
  QueueProducer,
  QueueScanner,
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
export class NestWebModule
  implements NestModule, OnApplicationBootstrap, BeforeApplicationShutdown
{
  private readonly logger = new Logger('NestApplication')

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly loggerFactory: LoggerFactory,
    @Optional()
    @Inject(REQUEST_LOGGER_OPTIONS)
    private readonly loggerOptions?: IRequestLoggerOptions,
    @Optional() private readonly consumer?: QueueConsumer,
  ) {}

  private static initialized: boolean = false
  private static routerMiddleware: (consumer: MiddlewareConsumer) => void
  private static workerHandlers: Type<IQueueHandler>[] = []

  static forRoot(options: {
    metrics: IRequestMetricsOptions
    router?: {
      enabled: boolean
      admin: boolean
      logger: IRequestLoggerOptions
      validator: ValidationPipeOptions
      middleware: (consumer: MiddlewareConsumer) => void
      routes: Routes
      imports: Type<any>[]
    }
    worker?: {
      enabled: boolean
      producer?: Type<IQueueProducer>
      consumer?: Type<IQueueConsumer>
      scanner?: Type<IQueueScanner>
      schedulers: IModuleProvider[]
      handlers: Type<IQueueHandler>[]
      imports: Type<any>[]
    }
    imports: Type<any>[]
  }): DynamicModule {
    if (this.initialized) {
      throw new Error('NestWebModule.forRoot() called multiple times')
    }
    this.initialized = true

    const imports: IModuleImport[] = options.imports
    const exports: IModuleExport[] = []
    const providers: IModuleProvider[] = []
    const controllers: IModuleController[] = [HealthController]

    if (options.metrics) {
      providers.push({
        provide: REQUEST_METRICS_OPTIONS,
        useValue: options.metrics,
      })

      if (options.metrics.defaultMetricsEnabled) {
        const registry: Registry = new Registry()

        if (options.metrics.defaultLabels) {
          registry.setDefaultLabels(options.metrics.defaultLabels)
        }

        if (options.metrics.interceptors) {
          providers.push(
            ...options.metrics.interceptors.map(interceptor => ({
              provide: APP_INTERCEPTOR,
              useClass: interceptor as Type<any>,
            })),
          )
        }

        exports.push(ReporterService)
        controllers.push(MetricsController)
        providers.push(
          {
            provide: Registry,
            useValue: registry,
          },
          MetricsService,
          ReporterService,
        )

        collectDefaultMetrics({ register: registry })
      }
    }

    if (options.router && options.router.enabled) {
      NestWebModule.routerMiddleware = options.router.middleware

      providers.push(
        {
          provide: APP_PIPE,
          useFactory: () => new ValidationPipe(options.router.validator),
        },
        {
          provide: REQUEST_LOGGER_OPTIONS,
          useValue: options.router.logger,
        },
      )

      if (options.router.admin) {
        imports.push(
          ServeStaticModule.forRoot({
            rootPath: FileUtil.joinRoot(['public', 'admin']),
            serveRoot: '/admin',
          }),
        )
      }

      imports.push(
        ...options.router.imports,
        ...options.router.routes.map(route => route.module),
        RouterModule.register(options.router.routes),
      )
    }

    if (options.worker && options.worker.enabled) {
      if (options.worker?.producer) {
        providers.push({
          provide: QueueProducer,
          useClass: options.worker.producer,
        })
        exports.push(QueueProducer)
      }

      if (options.worker?.consumer) {
        providers.push({
          provide: QueueConsumer,
          useClass: options.worker.consumer,
        })
        exports.push(QueueConsumer)
      }

      if (options.worker?.scanner) {
        providers.push({
          provide: QueueScanner,
          useClass: options.worker.scanner,
        })
        exports.push(QueueScanner)
      }

      this.workerHandlers = options.worker.handlers
      providers.push(...options.worker.handlers)
      providers.push(...options.worker.schedulers)
      imports.push(...options.worker.imports)
    }

    return {
      global: true,
      module: NestWebModule,
      providers: [
        ...providers,
        { provide: APP_FILTER, useClass: HttpExceptionFilter },
        { provide: APP_INTERCEPTOR, useClass: RequestContextInterceptor },
        { provide: APP_GUARD, useClass: ThrottlerGuard },

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
    consumer.apply(RequestContextMiddleware).forRoutes('*')

    // Middleware add logger
    if (this.loggerOptions?.autoLogging) {
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
    if (NestWebModule.routerMiddleware) {
      NestWebModule.routerMiddleware(consumer)
    }
  }

  // This hook runs after all modules have been initialized and all providers are ready
  async onApplicationBootstrap() {
    if (!this.consumer || NestWebModule.workerHandlers.length === 0) {
      return
    }

    for (const handler of NestWebModule.workerHandlers) {
      const instance = this.moduleRef.get(handler, {
        strict: false,
      })

      this.consumer.register(instance)

      this.logger.log(`Nest application registered topic: ${instance.topic} -> ${handler.name}`)
    }

    await this.consumer.start()
  }

  async beforeApplicationShutdown(_signal: string) {
    if (this.consumer) {
      await this.consumer.stop()
    }
  }
}
