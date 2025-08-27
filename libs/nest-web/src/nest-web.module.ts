import {
  DynamicModule,
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler'
import { ResponseHeadersInterceptor, ResponseTimeoutInterceptor } from './interceptors'
import {
  RequestBodyParserMiddleware,
  RequestCorsMiddleware,
  RequestPerformanceMiddleware,
  RequestSecurityMiddleware,
  RequestUserAgentMiddleware,
} from './middlewares'
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

@Module({})
export class NestWebModule implements NestModule {
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
  }

  static forRoot(options: ValidationPipeOptions): DynamicModule {
    return {
      global: true,
      module: NestWebModule,
      providers: [
        { provide: APP_INTERCEPTOR, useClass: ResponseTimeoutInterceptor },
        { provide: APP_INTERCEPTOR, useClass: ResponseHeadersInterceptor },
        { provide: APP_GUARD, useClass: ThrottlerGuard },
        {
          provide: APP_PIPE,
          useFactory: () => new ValidationPipe(options),
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
    }
  }
}
