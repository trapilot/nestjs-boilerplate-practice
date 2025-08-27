import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { AuthJwtRefreshPayloadDto } from 'lib/nest-auth/dtos'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class AuthJwtRefreshStrategy extends PassportStrategy(Strategy, 'jwtRefresh') {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme(config.get<string>('auth.jwt.prefix')),
      ignoreExpiration: false,
      jsonWebTokenOptions: {
        ignoreNotBefore: true,
        audience: config.get<string>('auth.jwt.audience'),
        issuer: config.get<string>('auth.jwt.issuer'),
      },
      secretOrKey: config.get<string>('auth.jwt.refreshToken.secretKey'),
    })
  }

  async validate(data: AuthJwtRefreshPayloadDto): Promise<AuthJwtRefreshPayloadDto> {
    return data
  }
}
