import { ENUM_FACT_TYPE } from '../enums'

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
    enum: [ENUM_FACT_TYPE.ABOUT_US, ENUM_FACT_TYPE.PRIVACY, ENUM_FACT_TYPE.TERM_AND_CONDITION],
  },
]
