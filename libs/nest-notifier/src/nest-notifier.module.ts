import { DynamicModule, Module } from '@nestjs/common'
import { EmailProvider, PushProvider, SmsProvider } from './providers'
import { NotifierService } from './services'

@Module({})
export class NestNotifierModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: NestNotifierModule,
      imports: [],
      providers: [NotifierService, SmsProvider, EmailProvider, PushProvider],
      exports: [NotifierService],
    }
  }
}
