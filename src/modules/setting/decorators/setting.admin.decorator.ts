import { UseGuards, applyDecorators } from '@nestjs/common'
import { SettingNotFoundGuard } from '../guards/setting.not-found.guard'
import { SettingPutToRequestGuard } from '../guards/setting.put-to-request.guard'

export function SettingAdminUpdateGuard(): MethodDecorator {
  return applyDecorators(UseGuards(SettingPutToRequestGuard, SettingNotFoundGuard))
}
