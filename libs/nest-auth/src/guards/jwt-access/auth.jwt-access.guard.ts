import { ExecutionContext, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { AUTH_ACCESS_REQUIRE_METADATA } from 'lib/nest-auth/constants'

@Injectable()
export class AuthJwtAccessGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super()
  }

  handleRequest<TUser = any>(err: Error, user: any, info: Error, context: ExecutionContext): TUser {
    const targets = [context.getHandler(), context.getClass()]

    const isAuthenticated = !err && user
    const isRequired = this.reflector.getAllAndOverride<boolean>(
      AUTH_ACCESS_REQUIRE_METADATA,
      targets,
    )

    if (isRequired) {
      if (!isAuthenticated) {
        throw new UnauthorizedException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'auth.error.accessTokenUnauthorized',
          _error: err ? err.message : info.message,
        })
      }

      /*
      if (!user?.sub) {
        throw new UnauthorizedException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'auth.error.accessTokenUnauthorized',
        })
      } else if (!isUUID(user?.sub)) {
        throw new UnauthorizedException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'auth.error.accessTokenUnauthorized',
        })
      }
      */
    }

    return user
  }
}
