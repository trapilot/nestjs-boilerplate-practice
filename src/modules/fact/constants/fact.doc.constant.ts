import { EnumFactType } from '../enums'

export const FACT_DOC_OPERATION = 'Fact'

export const FACT_DOC_ADMIN_QUERY_LIST = [
  // {
  //   name: 'categoryId',
  //   allowEmptyValue: false,
  //   required: false,
  //   type: () => Number,
  // },
  {
    name: 'type',
    allowEmptyValue: false,
    required: false,
    type: () => String,
    enum: [EnumFactType.ABOUT_US, EnumFactType.PRIVACY, EnumFactType.TERM_AND_CONDITION],
  },
]
