import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common'
import { APP_ENV_META_KEY } from '../constants'
import { EnumAppEnvironment, EnumScopeType } from '../enums'
import { AppEnvGuard } from '../guards'
import { ScopeContext } from '../helpers'
import { IScopeContextData } from '../interfaces'

export function AppEnvProtected(...envs: EnumAppEnvironment[]): MethodDecorator {
  return applyDecorators(UseGuards(AppEnvGuard), SetMetadata(APP_ENV_META_KEY, envs))
}

export function ScopeAsync(scope: EnumScopeType, options: { context: string }) {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const ctxData: IScopeContextData = {
      scopeType: scope,
      logger: {
        context: options.context,
      },
    }

    descriptor.value = function (...args: any[]) {
      // If the cron job is an async function, preserve the context using createAsync
      return ScopeContext.createAsync(ctxData, () => {
        return originalMethod.apply(this, args)
      })
    }

    return descriptor
  }
}
