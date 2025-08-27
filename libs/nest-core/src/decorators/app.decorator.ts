import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common'
import { APP_ENV_META_KEY } from '../constants'
import { ENUM_APP_ENVIRONMENT } from '../enums'
import { AppEnvGuard } from '../guards'

export function AppEnvProtected(...envs: ENUM_APP_ENVIRONMENT[]): MethodDecorator {
  return applyDecorators(UseGuards(AppEnvGuard), SetMetadata(APP_ENV_META_KEY, envs))
}
