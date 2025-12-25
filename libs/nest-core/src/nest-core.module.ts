import { createClient, createKeyv, RedisClientOptions } from '@keyv/redis'
import { HttpModule } from '@nestjs/axios'
import { BullModule } from '@nestjs/bullmq'
import { CacheModule, CacheOptions } from '@nestjs/cache-manager'
import { DynamicModule, Module } from '@nestjs/common'
import { ConfigFactory, ConfigModule, ConfigService } from '@nestjs/config'
import { APP_FILTER } from '@nestjs/core'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ScheduleModule } from '@nestjs/schedule'
import { NestLoggerModule } from 'lib/nest-logger'
import { NestNotifierModule } from 'lib/nest-notifier'
import { HeaderResolver, I18nJsonLoader, I18nModule } from 'nestjs-i18n'
import { join } from 'path'
import { APP_PATH, REALTIME_CACHE, REALTIME_PUB, REALTIME_STREAM, REALTIME_SUB } from './constants'
import { ENUM_MESSAGE_LANGUAGE } from './enums'
import { AppExceptionFilter } from './filters'
import {
  CryptoService,
  DateService,
  FileService,
  HelperService,
  MessageService,
  RealtimeService,
} from './services'

@Module({})
export class NestCoreModule {
  static forRoot(options: {
    configs: Array<ConfigFactory | Promise<ConfigFactory>>
    cache?: boolean
    envFilePath?: string[]
  }): DynamicModule {
    return {
      global: true,
      module: NestCoreModule,
      exports: [
        FileService,
        DateService,
        CryptoService,
        MessageService,
        RealtimeService,
        HelperService,
      ],
      providers: [
        FileService,
        DateService,
        CryptoService,
        MessageService,
        RealtimeService,
        HelperService,
        {
          provide: APP_FILTER,
          useFactory: (dateService: DateService, messageService: MessageService) => {
            return new AppExceptionFilter(dateService, messageService)
          },
          inject: [DateService, MessageService],
        },
        {
          provide: REALTIME_PUB,
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => {
            const host = configService.get<string>('redis.pubsub.host')
            const port = configService.get<number>('redis.pubsub.port')

            if (host && port) {
              const client = createClient({
                socket: { host, port },
                database: configService.get<number>('redis.pubsub.database', 2),
                username: configService.get<string>('redis.pubsub.username'),
                password: configService.get<string>('redis.pubsub.password'),
              })
              await client.connect()
              return client
            }
          },
        },
        {
          provide: REALTIME_SUB,
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => {
            const host = configService.get<string>('redis.pubsub.host')
            const port = configService.get<number>('redis.pubsub.port')

            if (host && port) {
              const client = createClient({
                socket: { host, port },
                database: configService.get<number>('redis.pubsub.database', 2),
                username: configService.get<string>('redis.pubsub.username'),
                password: configService.get<string>('redis.pubsub.password'),
              })
              await client.connect()
              return client
            }
          },
        },
        {
          provide: REALTIME_CACHE,
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => {
            const host = configService.get<string>('redis.realtime.host')
            const port = configService.get<number>('redis.realtime.port')

            if (host && port) {
              const client = createClient({
                socket: { host, port },
                database: configService.get<number>('redis.realtime.database', 3),
                username: configService.get<string>('redis.realtime.username'),
                password: configService.get<string>('redis.realtime.password'),
              })
              await client.connect()
              return client
            }
          },
        },
        {
          provide: REALTIME_STREAM,
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => {
            const host = configService.get<string>('redis.stream.host')
            const port = configService.get<number>('redis.stream.port')

            if (host && port) {
              const client = createClient({
                socket: { host, port },
                database: configService.get<number>('redis.stream.database', 4),
                username: configService.get<string>('redis.stream.username'),
                password: configService.get<string>('redis.stream.password'),
              })
              await client.connect()
              return client
            }
          },
        },
      ],
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: options.configs,
          cache: options.cache ?? true,
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
            fallbackLanguage: config.getOrThrow<ENUM_MESSAGE_LANGUAGE>('helper.message.fallback'),
            fallbacks: config
              .get<ENUM_MESSAGE_LANGUAGE[]>('helper.message.availableList')
              .reduce((a, v) => ({ ...a, [`${v}_*`]: v }), {}),
            loaderOptions: {
              path: join(APP_PATH, 'resources', 'languages'),
              watch: true,
            },
            logging: false,
            skipAsyncHook: true,
            throwOnMissingKey: false,
            viewEngine: config.get<'hbs' | 'pug' | 'ejs'>('app.view', 'hbs'),
          }),
        }),
        CacheModule.registerAsync({
          isGlobal: true,
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService): Promise<CacheOptions> => {
            const host = configService.get<string>('redis.cache.host')
            const port = configService.get<number>('redis.cache.port')
            const max = configService.get<number>('redis.cache.max')
            const ttl = configService.get<number>('redis.cache.ttl')

            if (host && port) {
              return {
                max,
                ttl,
                stores: [
                  createKeyv({
                    socket: { host, port },
                    database: configService.get<number>('redis.cache.database', 0),
                    username: configService.get<string>('redis.cache.username'),
                    password: configService.get<string>('redis.cache.password'),
                  } as RedisClientOptions).store,
                ],
              }
            }
            return { max, ttl }
          },
        }),
        BullModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            connection: {
              host: configService.get<string>('redis.queue.host'),
              port: configService.get<number>('redis.queue.port'),
              db: configService.get<number>('redis.cache.database', 1),
              username: configService.get<string>('redis.queue.username'),
              password: configService.get<string>('redis.queue.password'),
              tls: configService.get<any>('redis.queue.tls'),
            },
            defaultJobOptions: {
              backoff: {
                type: 'exponential',
                delay: 3_000,
              },
              attempts: 3,
            },
          }),
        }),
        EventEmitterModule.forRoot({ ignoreErrors: true }),
        ScheduleModule.forRoot(),
        NestLoggerModule.forRoot(),
        NestNotifierModule.forRoot(),
      ],
    }
  }
}
