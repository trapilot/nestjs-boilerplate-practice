import {
  BeforeApplicationShutdown,
  DynamicModule,
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  OnApplicationBootstrap,
  RequestMethod,
  Type,
  ValidationPipe,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  APP_FILTER,
  APP_GUARD,
  APP_INTERCEPTOR,
  APP_PIPE,
  ModuleRef,
  RouterModule,
} from '@nestjs/core'
import { ServeStaticModule } from '@nestjs/serve-static'
import { ThrottlerGuard, ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler'
import {
  FileUtil,
  IModuleController,
  IModuleExport,
  IModuleImport,
  IModuleProvider,
  LoggerFactory,
  WORKER_CONFIG,
  WorkerConsumer,
  WorkerProducer,
  WorkerScanner,
} from 'lib/nest-core'
import { collectDefaultMetrics, Registry } from 'prom-client'
import { REQUEST_LOGGER_OPTIONS, REQUEST_METRICS_OPTIONS } from './constants'
import { HealthController, MetricsController } from './controllers'
import { HttpExceptionFilter } from './filters'
import { RequestContextInterceptor } from './interceptors'
import { IWebModuleOptions } from './interfaces'
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
  IsDateFormatConstraint,
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
    private readonly ref: ModuleRef,
    private readonly loggerFactory: LoggerFactory,
  ) {}

  private static initialized: boolean = false
  private static options: IWebModuleOptions

  static forRoot(options: IWebModuleOptions): DynamicModule {
    if (this.initialized) {
      throw new Error('NestWebModule called multiple times')
    }
    this.initialized = true
    NestWebModule.options = options

    const imports: IModuleImport[] = []
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
        ...options.router.routes.filter(r => r?.module).map(r => r.module),
        ...options.router.middlewares.filter(m => m?.module).map(m => m.module),
        RouterModule.register(options.router.routes),
      )
    }

    if (options.worker && options.worker.enabled) {
      if (options.worker?.producer) {
        providers.push({
          provide: WorkerProducer,
          useClass: options.worker.producer,
        })
        exports.push(WorkerProducer)
      }

      if (options.worker?.consumer) {
        providers.push({
          provide: WorkerConsumer,
          useClass: options.worker.consumer,
        })
        exports.push(WorkerConsumer)
      }

      if (options.worker?.scanner) {
        providers.push({
          provide: WorkerScanner,
          useClass: options.worker.scanner,
        })
        exports.push(WorkerScanner)
      }

      providers.push(
        { provide: WORKER_CONFIG, useValue: options.worker.config },
        ...options.worker.modules.flatMap(w => w.handlers),
      )
      imports.push(...options.worker.modules.map(w => w.module))
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
        IsDateFormatConstraint,
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
    const allRoutes = [{ path: '*', method: RequestMethod.ALL }]
    consumer.apply(RequestContextMiddleware).forRoutes('*')

    // Middleware add logger
    const routerLogger = NestWebModule.options.router.logger
    if (routerLogger?.autoLogging) {
      const excludeRoutes = routerLogger.excludeRoutes
      const applyRoutes = routerLogger.applyRoutes

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
    const routerMiddlewares = NestWebModule.options.router.middlewares
    if (routerMiddlewares.length) {
      routerMiddlewares.forEach(config => {
        const excludeRoutes = config.excludeRoutes
        const applyRoutes = config.applyRoutes

        excludeRoutes
          ? consumer
              .apply(config.middleware)
              .exclude(...excludeRoutes)
              .forRoutes(...(applyRoutes || allRoutes))
          : consumer.apply(config.middleware).forRoutes(...(applyRoutes || allRoutes))
      })
    }
  }

  // This hook runs after all modules have been initialized and all providers are ready
  async onApplicationBootstrap() {
    if (NestWebModule.options?.worker?.enabled) {
      const workerConsumer = this.ref.get(WorkerConsumer, { strict: false })
      const workerHandlers = NestWebModule.options.worker.modules.flatMap(w => w.handlers)

      for (const handler of workerHandlers) {
        const instance = this.ref.get(handler, { strict: false })

        workerConsumer.register(instance)

        this.logger.log(`Queue Worker registered topic: ${instance.topic}`)
        // this.logger.log(`Registered topic: ${instance.topic} -> ${handler.name}`)
      }

      await workerConsumer.start()
    }
  }

  async beforeApplicationShutdown(_signal: string) {
    if (NestWebModule.options?.worker?.enabled) {
      const workerConsumer = this.ref.get(WorkerConsumer, { strict: false })

      await workerConsumer.stop()
    }
  }
}
