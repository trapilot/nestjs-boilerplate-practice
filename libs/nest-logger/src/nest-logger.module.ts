import {
  DynamicModule,
  Inject,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common'
import { LOGGER_MODULE_OPTIONS } from './constants'
import { ILoggerOptions } from './interfaces'
import { LoggerOptionService, LoggerService } from './services'
import { LoggerUtil } from './utils'

@Module({})
export class NestLoggerModule implements NestModule {
  constructor(@Inject(LOGGER_MODULE_OPTIONS) private readonly options: ILoggerOptions) {}

  configure(consumer: MiddlewareConsumer) {
    const { pinoHttp, assignResponse } = this.options

    consumer
      .apply(...LoggerUtil.createMiddlewares(pinoHttp, assignResponse))
      .exclude(
        { path: '*', method: RequestMethod.OPTIONS },
        { path: 'audit/*spat', method: RequestMethod.ALL },
        { path: 'v:version/audit/*spat', method: RequestMethod.ALL },
      )
      .forRoutes(
        { path: 'admin/*spat', method: RequestMethod.ALL },
        { path: 'v:version/admin/*spat', method: RequestMethod.ALL },
        { path: 'app/*spat', method: RequestMethod.ALL },
        { path: 'v:version/app/*spat', method: RequestMethod.ALL },
        { path: 'web/*spat', method: RequestMethod.ALL },
        { path: 'v:version/web/*spat', method: RequestMethod.ALL },
      )
  }

  static forRoot(): DynamicModule {
    return {
      global: true,
      module: NestLoggerModule,
      imports: [],
      providers: [
        LoggerService,
        LoggerOptionService,
        {
          provide: LOGGER_MODULE_OPTIONS,
          useFactory: async (optionsFactory: LoggerOptionService) => optionsFactory.createOptions(),
          inject: [LoggerOptionService],
        },
      ],
      exports: [LoggerService],
    }
  }
}
