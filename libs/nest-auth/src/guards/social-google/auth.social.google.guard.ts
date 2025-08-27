import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { IRequestApp } from 'lib/nest-core'
import { AuthSocialGooglePayloadDto } from '../../dtos'
import { AuthService } from '../../services'

@Injectable()
export class AuthSocialGoogleGuard implements CanActivate {
  private readonly header: string
  private readonly prefix: string

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    this.header = this.configService.get<string>('auth.google.header')
    this.prefix = this.configService.get<string>('auth.google.prefix')
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IRequestApp<AuthSocialGooglePayloadDto>>()

    const requestHeader =
      (request.headers[`${this.header?.toLowerCase()}`] as string)?.split(`${this.prefix} `) ?? []

    if (!requestHeader || requestHeader.length !== 2) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'auth.error.socialGoogleRequired',
      })
    }

    try {
      const accessToken: string = requestHeader[1]
      const payload = await this.authService.googleGetTokenInfo(accessToken)

      request.user = payload

      return true
    } catch (err: any) {
      console.log({ err })
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'auth.error.socialGoogleInvalid',
        _error: err.message,
      })
    }
  }
}
