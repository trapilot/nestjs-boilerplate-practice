import { ForbiddenException, HttpStatus, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class AuthJwtRefreshGuard extends AuthGuard('jwtRefresh') {
  handleRequest<TUser = any>(err: Error, user: any, info: Error): TUser {
    if (err || !user) {
      throw new ForbiddenException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'auth.error.refreshTokenUnauthorized',
        _error: err ? err.message : info.message,
      })
    }

    /*
    if (!user?.sub) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'auth.error.refreshTokenUnauthorized',
      })
    } else if (!isUUID(user?.sub)) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'auth.error.refreshTokenUnauthorized',
      })
    }
    */

    return user
  }
}
