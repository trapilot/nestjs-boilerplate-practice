import { DynamicModule, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { APP_PATH, ENUM_MESSAGE_LANGUAGE } from 'lib/nest-core'
import { HeaderResolver, I18nJsonLoader, I18nModule } from 'nestjs-i18n'
import { join } from 'path'
import { MessageService } from './services'

@Module({})
export class NestMessageModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: NestMessageModule,
      providers: [MessageService],
      exports: [MessageService],
      imports: [
        I18nModule.forRootAsync({
          loader: I18nJsonLoader,
          inject: [ConfigService],
          resolvers: [new HeaderResolver(['x-language'])],
          useFactory: (config: ConfigService) => ({
            fallbackLanguage: config.getOrThrow<ENUM_MESSAGE_LANGUAGE>('app.message.fallback'),
            fallbacks: config
              .get<ENUM_MESSAGE_LANGUAGE[]>('app.message.availableList')
              .reduce((a, v) => ({ ...a, [`${v}_*`]: v }), {}),
            loaderOptions: {
              path: join(APP_PATH, 'languages'),
              watch: true,
            },
            logging: false,
            skipAsyncHook: true,
            throwOnMissingKey: false,
            viewEngine: config.get<'hbs' | 'pug' | 'ejs'>('app.view', 'hbs'),
          }),
        }),
      ],
    }
  }
}
