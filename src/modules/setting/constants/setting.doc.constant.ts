import { EnumSettingGroup } from '../enums/setting.enum'

export const SETTING_DOC_OPERATION = 'Setting'

export const SETTING_DOC_REQUEST_PARAMS = [
  {
    name: 'id',
    allowEmptyValue: false,
    required: true,
    type: 'number',
    description: 'setting id',
  },
]

export const SETTING_DOC_REQUEST_LIST = [
  {
    name: 'group',
    allowEmptyValue: true,
    required: false,
    type: 'string',
    enum: EnumSettingGroup,
    enumName: 'EnumSettingGroup',
    description: 'Group',
  },
]
