import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { IRequestApp } from 'lib/nest-core'
import { AuthSocialApplePayloadDto } from '../../dtos'
import { AuthService } from '../../services'

@Injectable()
export class AuthSocialAppleGuard implements CanActivate {
  private readonly header: string
  private readonly prefix: string

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    this.header = this.configService.get<string>('auth.apple.header')
    this.prefix = this.configService.get<string>('auth.apple.prefix')
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IRequestApp<AuthSocialApplePayloadDto>>()

    const requestHeader =
      (request.headers[`${this.header?.toLowerCase()}`] as string)?.split(`${this.prefix} `) ?? []

    if (!requestHeader || requestHeader.length !== 2) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'auth.error.socialAppleRequired',
      })
    }

    const accessToken: string = requestHeader[1]

    try {
      const payload = await this.authService.appleGetTokenInfo(accessToken)

      request.user = payload

      return true
    } catch (err: any) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'auth.error.socialAppleInvalid',
        _error: err.message,
      })
    }
  }
}
