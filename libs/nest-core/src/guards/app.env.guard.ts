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
import { EnumAppEnvironment } from '../enums'

@Injectable()
export class AppEnvGuard implements CanActivate {
  private readonly env: EnumAppEnvironment

  constructor(
    private readonly reflector: Reflector,
    private readonly config: ConfigService,
  ) {
    this.env = this.config.get<EnumAppEnvironment>('app.env')
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required: EnumAppEnvironment[] = this.reflector.getAllAndOverride<EnumAppEnvironment[]>(
      APP_ENV_META_KEY,
      [context.getHandler(), context.getClass()],
    )

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
