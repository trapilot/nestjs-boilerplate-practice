import { EnumPageType } from '../enums'

export const PAGE_DOC_OPERATION = 'Page'

export const PAGE_DOC_ADMIN_QUERY_LIST = [
  // {
  //   name: 'categoryId',
  //   allowEmptyValue: false,
  //   required: false,
  //   type: 'number',
  // },
  {
    name: 'type',
    allowEmptyValue: false,
    required: false,
    type: 'string',
    enum: [EnumPageType.ABOUT_US, EnumPageType.PRIVACY, EnumPageType.TERM_AND_CONDITION],
    enumName: 'EnumPageType',
  },
]
