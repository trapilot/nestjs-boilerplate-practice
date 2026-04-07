import { createKeyv } from '@keyv/redis'
import { HttpModule } from '@nestjs/axios'
import { BullModule } from '@nestjs/bullmq'
import { CACHE_MANAGER, CacheModule, CacheOptions } from '@nestjs/cache-manager'
import { DynamicModule, Module } from '@nestjs/common'
import { ConfigFactory, ConfigModule, ConfigService } from '@nestjs/config'
import { APP_FILTER } from '@nestjs/core'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ScheduleModule } from '@nestjs/schedule'
import { HeaderResolver, I18nJsonLoader, I18nModule } from 'nestjs-i18n'
import { QUEUE_CONFIG_KEY, QUEUE_PROCESSOR_CONFIG_KEY } from './constants'
import { PushDispatcher, SmsDispatcher } from './dispatchers'
import { EnumAppEnvironment, EnumAppLanguage, EnumFileExtensionTemplate } from './enums'
import { AppExceptionFilter } from './filters'
import { LoggerFactory, PushRegistry, SmsRegistry, TransportRegistry } from './helpers'
import {
  CacheService,
  HelperService,
  LoggerService,
  MailerService,
  MessageService,
  RunnerService,
} from './services'
import { FileUtil } from './utils'

@Module({})
export class NestCoreModule {
  private static initialized: boolean = false

  static forRoot(options: {
    configs: Array<ConfigFactory | Promise<ConfigFactory>>
    cache: boolean
    envFilePath: string[]
  }): DynamicModule {
    if (this.initialized) {
      throw new Error('NestCoreModule called multiple times')
    }
    this.initialized = true

    return {
      global: true,
      module: NestCoreModule,
      exports: [
        MessageService,
        LoggerService,
        MailerService,
        RunnerService,
        HelperService,
        CacheService,
        LoggerFactory,
        SmsDispatcher,
        PushDispatcher,
      ],
      providers: [
        MessageService,
        LoggerService,
        MailerService,
        RunnerService,
        HelperService,
        LoggerFactory,
        SmsRegistry,
        PushRegistry,
        TransportRegistry,
        SmsDispatcher,
        PushDispatcher,
        {
          provide: CacheService,
          useExisting: CACHE_MANAGER,
        },
        {
          provide: APP_FILTER,
          inject: [LoggerService, MessageService, HelperService],
          useFactory: (logger: LoggerService, message: MessageService, helper: HelperService) => {
            return new AppExceptionFilter(logger, message, helper) // NOTE: must inject correct order
          },
        },
      ],
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: options.configs,
          cache: options?.cache,
          envFilePath: options?.envFilePath ?? ['.env'],
          expandVariables: false,
        }),
        HttpModule.registerAsync({
          global: true,
          useFactory: (config: ConfigService) => ({
            timeout: config.get<number>('helper.http.timeout'),
            maxRedirects: config.get<number>('helper.http.maxRedirects'),
          }),
          inject: [ConfigService],
        }),
        I18nModule.forRootAsync({
          loader: I18nJsonLoader,
          inject: [ConfigService],
          resolvers: [new HeaderResolver(['x-language'])],
          useFactory: (config: ConfigService) => ({
            fallbackLanguage: config.getOrThrow<EnumAppLanguage>('helper.message.fallback'),
            fallbacks: config
              .get<EnumAppLanguage[]>('helper.message.availableList')
              .reduce((a, v) => ({ ...a, [`${v}_*`]: v, [`${v}-*`]: v }), {}),
            loaderOptions: {
              path: FileUtil.joinApp(['resources', 'languages']),
              watch: true,
            },
            logging: false,
            skipAsyncHook: true,
            throwOnMissingKey: false,
            viewEngine: config.get<EnumFileExtensionTemplate>(
              'helper.message.viewEngine',
              EnumFileExtensionTemplate.HBS,
            ),
          }),
        }),
        CacheModule.registerAsync({
          isGlobal: true,
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (config: ConfigService): Promise<CacheOptions> => {
            return {
              namespace: config.get<string>('redis.cache.namespace'),
              stores: [
                createKeyv(
                  { url: config.get<string>('redis.cache.url') },
                  {
                    connectionTimeout: 30000,
                    namespace: config.get<string>('redis.cache.namespace'),
                    useUnlink: true,
                    keyPrefixSeparator: ':',
                  },
                ),
              ],
            }
          },
        }),
        BullModule.forRootAsync(QUEUE_CONFIG_KEY, {
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            connection: {
              url: config.get<string>('redis.queue.url'),
              connectionName: `${config.get<string>(
                'app.name',
              )}-${config.get<EnumAppEnvironment>('app.env')}:queue`,
            },
            prefix: config.get<string>('redis.queue.namespace'),
            defaultJobOptions: {
              backoff: {
                type: 'exponential',
                delay: 3000,
              },
              attempts: 3,
              removeOnComplete: 20,
              removeOnFail: 50,
            },
          }),
        }),
        BullModule.forRootAsync(QUEUE_PROCESSOR_CONFIG_KEY, {
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            connection: {
              url: config.get<string>('redis.queue.url'),
              connectionName: `${config.get<string>(
                'app.name',
              )}-${config.get<EnumAppEnvironment>('app.env')}:processor`,
            },
            prefix: config.get<string>('redis.queue.namespace'),
            defaultJobOptions: {
              backoff: {
                type: 'exponential',
                delay: 3000,
              },
              attempts: 3,
              removeOnComplete: 20,
              removeOnFail: 50,
            },
          }),
        }),
        ScheduleModule.forRoot(),
        EventEmitterModule.forRoot({
          wildcard: true,
          delimiter: ':',
          newListener: false,
          removeListener: false,
          maxListeners: 10, // the maximum amount of listeners that can be assigned to an event
          verboseMemoryLeak: true, // show event name in memory leak message when more than maximum amount of listeners is assigned
          ignoreErrors: false,
        }),
      ],
    }
  }
}
