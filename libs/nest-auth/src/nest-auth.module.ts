import { DynamicModule, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt'
import {
  AUTH_ABILITY_CONFIG_TOKEN,
  AUTH_ABILITY_CONTEXT_TOKEN,
  AUTH_ABILITY_FACTORY_TOKEN,
} from './constants'
import { AuthJwtAccessStrategy, AuthJwtRefreshStrategy } from './guards'
import { AuthContext } from './helpers'
import { AuthModuleOptions, IAuthAbilityConfig } from './interfaces'
import { AuthService } from './services'

@Module({})
export class NestAuthModule {
  static forRoot(options: AuthModuleOptions): DynamicModule {
    return {
      global: true,
      module: NestAuthModule,
      providers: [
        AuthService,
        AuthJwtAccessStrategy,
        AuthJwtRefreshStrategy,
        {
          provide: AUTH_ABILITY_CONFIG_TOKEN,
          useValue: {
            subjects: Object.values(options.subjects),
            actions: Object.values(options.actions),
          },
        },
        {
          provide: AUTH_ABILITY_FACTORY_TOKEN,
          useClass: options.factory,
        },
        {
          provide: AUTH_ABILITY_CONTEXT_TOKEN,
          inject: [AUTH_ABILITY_CONFIG_TOKEN],
          useFactory: (config: IAuthAbilityConfig) => {
            AuthContext.setConfig(config)
            return true
          },
        },
      ],
      exports: [AuthService, AUTH_ABILITY_CONFIG_TOKEN, AUTH_ABILITY_FACTORY_TOKEN],
      imports: [
        JwtModule.registerAsync({
          inject: [ConfigService],
          imports: [ConfigModule],
          useFactory: (config: ConfigService): JwtModuleOptions => ({
            secret: config.get<string>('helper.jwt.defaultSecretKey'),
            signOptions: {
              expiresIn: config.get<string>('helper.jwt.defaultExpirationTime'),
            },
          }),
        }),
      ],
    }
  }
}
