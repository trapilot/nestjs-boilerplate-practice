import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpStatus,
  Injectable,
} from '@nestjs/common'
import { ModuleRef, Reflector } from '@nestjs/core'
import {
  AUTH_ACCESS_REQUIRE_METADATA,
  AUTH_ACCESS_SYNCHRONIZE_METADATA,
  AUTH_ACCESS_USER_ACTIVE_METADATA,
  AUTH_ACCESS_USER_HMAC_METADATA,
  AUTH_ACCESS_USER_UNIQUE_METADATA,
  AUTH_SCOPE_META_KEY,
  ENUM_AUTH_SCOPE_TYPE,
  IAuthValidator,
} from 'lib/nest-auth'
import { IRequestApp } from 'lib/nest-core'

@Injectable()
export class AuthUserScopeGuard implements CanActivate {
  constructor(
    private readonly ref: ModuleRef,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IRequestApp>()

    const isAuthenticated = !!request?.user
    const isRequired = this.reflector.getAllAndOverride<boolean>(AUTH_ACCESS_REQUIRE_METADATA, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isRequired && !isAuthenticated) {
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'auth.error.notLoggedInYet',
      })
    }

    if (isAuthenticated) {
      await this.synchronize(context)

      const { user: payload } = request

      const scopes = this.reflector.get<ENUM_AUTH_SCOPE_TYPE>(
        AUTH_SCOPE_META_KEY,
        context.getHandler(),
      )

      if (scopes.length === 0) {
        throw new ForbiddenException({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'auth.error.scopePredefinedNotFound',
        })
      }
      if (!scopes.includes(payload.scopeType)) {
        throw new ForbiddenException({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'auth.error.scopePredefinedNotFound',
        })
      }
    }

    return true
  }

  private async synchronize(context: ExecutionContext): Promise<any> {
    const targets = [context.getHandler(), context.getClass()]

    const syncRequired = this.reflector.getAllAndOverride<boolean>(
      AUTH_ACCESS_SYNCHRONIZE_METADATA,
      targets,
    )

    const hmacRequired = this.reflector.getAllAndOverride<boolean>(
      AUTH_ACCESS_USER_HMAC_METADATA,
      targets,
    )

    if (syncRequired || hmacRequired) {
      try {
        const request = context.switchToHttp().getRequest<IRequestApp>()
        const { user: payload } = request

        const validator: IAuthValidator = this.ref.get(payload.scopeType, { strict: false })
        const { userData, userPayload } = await validator.validatePayload(payload, request, {
          hmac: hmacRequired,
        })

        const checkActivated = this.reflector.getAllAndOverride<boolean>(
          AUTH_ACCESS_USER_ACTIVE_METADATA,
          targets,
        )
        if (checkActivated && !userData.isActive) {
          throw new ForbiddenException({
            statusCode: HttpStatus.FORBIDDEN,
            message: `auth.error.inactive`,
          })
        }

        const checkUnique = this.reflector.getAllAndOverride<boolean>(
          AUTH_ACCESS_USER_UNIQUE_METADATA,
          targets,
        )
        if (checkUnique) {
          const newDate = new Date(userData.loginDate).getTime()
          const oldDate = new Date(payload.loginDate).getTime()
          if (userData.loginToken !== payload.loginToken || newDate !== oldDate) {
            throw new ForbiddenException({
              statusCode: HttpStatus.FORBIDDEN,
              message: 'auth.error.uniqueLoggedIn',
            })
          }
        }

        // override payload data
        payload.user = userPayload
      } catch {
        throw new ForbiddenException({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'auth.error.typePredefinedNotFound',
        })
      }
    }
  }
}
