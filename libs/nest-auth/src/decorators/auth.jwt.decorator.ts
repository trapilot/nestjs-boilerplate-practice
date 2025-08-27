import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UseGuards,
} from '@nestjs/common'
import { IRequestApp, IStringParseOptions, NestHelper } from 'lib/nest-core'
import { AUTH_ABILITY_META_KEY, AUTH_SCOPE_META_KEY } from '../constants'
import { ENUM_AUTH_SCOPE_TYPE } from '../enums'
import {
  AuthJwtAccessGuard,
  AuthJwtRefreshGuard,
  AuthUserAbilityGuard,
  AuthUserScopeGuard,
} from '../guards'
import { IAuthAbility, IAuthJwtProtectedOptions } from '../interfaces'

interface AuthJwtPayloadOptions extends Pick<IStringParseOptions, 'parseAs'> {}

export const AuthJwtPayload = createParamDecorator(
  <T>(data: string | [string, AuthJwtPayloadOptions], context: ExecutionContext): T => {
    const request = context.switchToHttp().getRequest<IRequestApp>()

    let path: string
    let options: AuthJwtPayloadOptions = {}

    if (Array.isArray(data)) {
      ;[path, options] = data
    } else {
      path = data
    }

    let payload: any = request.user || undefined
    const properties = path?.split('.') ?? []

    while (payload && properties.length) {
      payload = payload[properties.shift()] ?? undefined
    }

    // // Handle runtime type parsing
    payload = NestHelper.parse(payload, {
      ...options,
      errorAs: options?.parseAs === 'id' ? 0 : undefined,
    })

    return payload as T
  },
)

export const AuthJwtType = createParamDecorator(
  (data: string, context: ExecutionContext): string => {
    const { headers } = context.switchToHttp().getRequest<IRequestApp>()
    const { authorization } = headers
    const authorizations: string[] = authorization.split(' ')

    return authorizations.length >= 2 ? authorizations[0] : undefined
  },
)

export const AuthJwtToken = createParamDecorator(
  (data: string, context: ExecutionContext): string => {
    const { headers } = context.switchToHttp().getRequest<IRequestApp>()
    const { authorization } = headers
    const authorizations: string[] = authorization.split(' ')

    return authorizations.length >= 2 ? authorizations[1] : undefined
  },
)

export function AuthJwtAccessProtected(options?: IAuthJwtProtectedOptions): MethodDecorator {
  const guards = options?.guards ?? []
  const decorators = []
  if (options?.metadata) {
    for (const metadata in options.metadata) {
      decorators.push(SetMetadata(metadata, options.metadata[metadata]))
    }
  }

  return applyDecorators(UseGuards(AuthJwtAccessGuard), UseGuards(...guards), ...decorators)
}

export function AuthJwtRefreshProtected(): MethodDecorator {
  return applyDecorators(UseGuards(AuthJwtRefreshGuard))
}

export function AuthUserAbilityProtected(...handlers: IAuthAbility[]): MethodDecorator {
  return applyDecorators(
    UseGuards(AuthUserAbilityGuard),
    SetMetadata(AUTH_ABILITY_META_KEY, handlers),
  )
}

export function AuthUserScopeProtected(...scopes: ENUM_AUTH_SCOPE_TYPE[]): MethodDecorator {
  return applyDecorators(UseGuards(AuthUserScopeGuard), SetMetadata(AUTH_SCOPE_META_KEY, scopes))
}
