import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { IAuthJwtPayload } from '../../interfaces'

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

  async validate(data: IAuthJwtPayload, _done: Function): Promise<IAuthJwtPayload> {
    return data
  }
}
