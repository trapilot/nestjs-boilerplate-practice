import { DynamicModule, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt'
import { AuthUserAbilityFactory } from './factories'
import { AuthJwtAccessStrategy, AuthJwtRefreshStrategy } from './guards'
import { AuthService } from './services'
import { AUTH_ABILITY_FACTORY_TOKEN } from './constants'

@Module({})
export class NestAuthModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: NestAuthModule,
      providers: [
        AuthService,
        AuthJwtAccessStrategy,
        AuthJwtRefreshStrategy,
        {
          provide: AUTH_ABILITY_FACTORY_TOKEN,
          useClass: AuthUserAbilityFactory,
        },
      ],
      exports: [AuthService, AUTH_ABILITY_FACTORY_TOKEN],
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
