import { HttpStatus, Module } from '@nestjs/common'
import { ValidationError } from 'class-validator'
import { NestAuthModule } from 'lib/nest-auth'
import { EntityValidateException, NestCoreModule } from 'lib/nest-core'
import { NestPrismaModule } from 'lib/nest-prisma'
import { NestWebModule } from 'lib/nest-web'
import configs from '../configs'
import { AppController } from './controllers'
import { MiddlewareModule } from './middleware'
import { RouterModule } from './router'
import { WorkerModule } from './worker'

@Module({
  controllers: [AppController],
  imports: [
    // Library
    NestPrismaModule.forRoot(),
    NestAuthModule.forRoot(),
    NestCoreModule.forRoot({
      config: {
        isGlobal: true,
        cache: true,
        expandVariables: true,
        envFilePath: ['.env'],
        load: configs,
      },
      cache: { isGlobal: true },
    }),
    NestWebModule.forRoot({
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
    }),

    // Application
    MiddlewareModule,
    WorkerModule.register(),
    RouterModule.register({ http: true }),
  ],
})
export class AppModule {}
