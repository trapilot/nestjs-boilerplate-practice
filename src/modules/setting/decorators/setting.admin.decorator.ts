import { UseGuards, applyDecorators } from '@nestjs/common'
import { SettingNotFoundGuard, SettingPutToRequestGuard } from '../guards'

export function SettingAdminUpdateGuard(): MethodDecorator {
  return applyDecorators(UseGuards(SettingPutToRequestGuard, SettingNotFoundGuard))
}
