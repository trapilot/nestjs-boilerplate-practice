import { HttpModule } from '@nestjs/axios'
import { CacheModule, CacheModuleOptions } from '@nestjs/cache-manager'
import { DynamicModule, Module } from '@nestjs/common'
import { ConfigModule, ConfigModuleOptions, ConfigService } from '@nestjs/config'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ScheduleModule } from '@nestjs/schedule'
import { NestFileModule } from 'lib/nest-file'
import { NestLoggerModule } from 'lib/nest-logger'
import { NestMessageModule } from 'lib/nest-message'
import { NestNotifierModule } from 'lib/nest-notifier'
import {
  HelperArrayService,
  HelperCryptoService,
  HelperDateService,
  HelperNumberService,
  HelperStringService,
} from './services'

@Module({})
export class NestCoreModule {
  static forRoot(options: {
    config: ConfigModuleOptions
    cache: CacheModuleOptions
  }): DynamicModule {
    return {
      global: true,
      module: NestCoreModule,
      providers: [
        HelperArrayService,
        HelperDateService,
        HelperCryptoService,
        HelperNumberService,
        HelperStringService,
      ],
      exports: [
        HelperArrayService,
        HelperDateService,
        HelperCryptoService,
        HelperNumberService,
        HelperStringService,
      ],
      imports: [
        ConfigModule.forRoot(options.config),
        CacheModule.register(options.cache),
        EventEmitterModule.forRoot({ ignoreErrors: true }),
        ScheduleModule.forRoot(),
        NestFileModule.forRoot(),
        NestLoggerModule.forRoot(),
        NestNotifierModule.forRoot(),
        NestMessageModule.forRoot(),
        HttpModule.registerAsync({
          global: true,
          useFactory: (config: ConfigService) => ({
            timeout: config.get<number>('helper.http.timeout'),
            maxRedirects: config.get<number>('helper.http.maxRedirects'),
          }),
          inject: [ConfigService],
        }),
      ],
    }
  }
}
