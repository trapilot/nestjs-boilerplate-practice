import { DynamicModule, Module } from '@nestjs/common'
import { NestAuthModule } from 'lib/nest-auth'
import { EnumAuthAbilityAction, EnumAuthAbilitySubject } from './enums'
import { UserAbilityFactory } from './helpers'
import { EmailProvider, PushProvider, SmsProvider } from './providers'
import { NotifierService } from './services'

@Module({})
export class SharedModule {
  static register(): DynamicModule {
    return {
      global: true,
      module: SharedModule,
      providers: [NotifierService, SmsProvider, EmailProvider, PushProvider],
      exports: [NotifierService],
      imports: [
        NestAuthModule.forRoot({
          abilityFactory: UserAbilityFactory,
          subjects: EnumAuthAbilitySubject,
          actions: EnumAuthAbilityAction,
        }),
      ],
    }
  }
}
