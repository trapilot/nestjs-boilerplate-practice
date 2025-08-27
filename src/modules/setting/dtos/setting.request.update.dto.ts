import { OmitType } from '@nestjs/swagger'
import { SettingRequestCreateDto } from './setting.request.create.dto'

export class SettingRequestUpdateDto extends OmitType(SettingRequestCreateDto, [
  'name',
  'group',
  'type',
] as const) {}
