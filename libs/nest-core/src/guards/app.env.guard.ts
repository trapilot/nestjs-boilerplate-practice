import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpStatus,
  Injectable,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { APP_ENV_META_KEY } from '../constants'
import { ENUM_APP_ENVIRONMENT } from '../enums'

@Injectable()
export class AppEnvGuard implements CanActivate {
  private readonly env: ENUM_APP_ENVIRONMENT

  constructor(
    private readonly reflector: Reflector,
    private readonly config: ConfigService,
  ) {
    this.env = this.config.get<ENUM_APP_ENVIRONMENT>('app.env')
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required: ENUM_APP_ENVIRONMENT[] = this.reflector.getAllAndOverride<
      ENUM_APP_ENVIRONMENT[]
    >(APP_ENV_META_KEY, [context.getHandler(), context.getClass()])

    if (!required) {
      return true
    } else if (!required.includes(this.env)) {
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'http.clientError.forbidden',
      })
    }

    return true
  }
}
