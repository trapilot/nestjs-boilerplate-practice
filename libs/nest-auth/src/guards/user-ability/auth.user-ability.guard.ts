import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import {
  AUTH_ABILITY_META_KEY,
  AUTH_ABILITY_FACTORY_TOKEN,
  AUTH_ACCESS_REQUIRE_METADATA,
  AuthUserAbilityFactory,
  IAuthAbility,
} from 'lib/nest-auth'
import { IRequestApp } from 'lib/nest-core'

@Injectable()
export class AuthUserAbilityGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(AUTH_ABILITY_FACTORY_TOKEN) private readonly abilityFactory: AuthUserAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IRequestApp>()
    const { user: payload } = request

    const isAuthenticated = !!payload
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
      const abilities = this.reflector.get<IAuthAbility[]>(
        AUTH_ABILITY_META_KEY,
        context.getHandler(),
      )

      if (abilities.length === 0) {
        throw new ForbiddenException({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'auth.error.abilityPredefinedNotFound',
        })
      }

      // console.log({ payload })
      const userPermissions = this.abilityFactory.parseFromRequest(payload.user?.permissions)

      const handler = this.abilityFactory.handlerAbilities(abilities)
      const rule = this.abilityFactory.defineFromRequest(userPermissions)
      const check: boolean = handler.every((handler) => handler(rule))

      if (!check) {
        if (abilities.length > 1) {
          throw new BadRequestException({
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'auth.error.abilityForbidden',
          })
        }

        throw new ForbiddenException({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'auth.error.abilityForbidden',
        })
      }
    }

    return true
  }
}
