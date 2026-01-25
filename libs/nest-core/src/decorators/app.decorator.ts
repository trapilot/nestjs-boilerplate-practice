import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common'
import { APP_ENV_META_KEY } from '../constants'
import { ScopeContext } from '../contexts'
import { EnumAppEnvironment, EnumScopeType } from '../enums'
import { AppEnvGuard } from '../guards'
import { IScopeContextData } from '../interfaces'

export function AppEnvProtected(...envs: EnumAppEnvironment[]): MethodDecorator {
  return applyDecorators(UseGuards(AppEnvGuard), SetMetadata(APP_ENV_META_KEY, envs))
}

export function OnScope(
  scope: EnumScopeType,
  options: { async?: boolean; raw?: boolean; context: string },
) {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const ctxData: IScopeContextData = {
      scopeType: scope,
      logger: {
        context: options?.raw === true ? options.context : `${scope}.${options.context}`,
      },
    }

    descriptor.value = function (...args: any[]) {
      if (options.async === true) {
        // If scope run in an async function, preserve the context using createAsync
        return ScopeContext.createAsync(ctxData, () => {
          return originalMethod.apply(this, args)
        })
      }

      return ScopeContext.create(ctxData, () => {
        return originalMethod.apply(this, args)
      })
    }

    return descriptor
  }
}
