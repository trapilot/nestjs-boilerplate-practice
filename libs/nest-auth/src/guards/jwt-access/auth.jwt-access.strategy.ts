import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { AuthJwtAccessPayloadDto } from 'lib/nest-auth/dtos'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class AuthJwtAccessStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme(config.get<string>('auth.jwt.prefix')),
      ignoreExpiration: false,
      jsonWebTokenOptions: {
        ignoreNotBefore: true,
        audience: config.get<string>('auth.jwt.audience'),
        issuer: config.get<string>('auth.jwt.issuer'),
      },
      secretOrKey: config.get<string>('auth.jwt.accessToken.secretKey'),
    })
  }

  async validate(data: AuthJwtAccessPayloadDto, _done: Function): Promise<AuthJwtAccessPayloadDto> {
    return data
  }
}
