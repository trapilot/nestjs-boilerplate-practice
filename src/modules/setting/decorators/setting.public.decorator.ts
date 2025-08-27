import { UseGuards, applyDecorators } from '@nestjs/common'
import { SettingNotFoundGuard, SettingPutToRequestGuard } from '../guards'

export function SettingPublicGetGuard(): MethodDecorator {
  return applyDecorators(UseGuards(SettingPutToRequestGuard, SettingNotFoundGuard))
}
