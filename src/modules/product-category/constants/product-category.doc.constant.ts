export const PRODUCT_CATEGORY_DOC_OPERATION = 'Product Category'

export const PRODUCT_CATEGORY_DOC_APP_QUERY_LIST = [
  {
    name: 'brandId',
    allowEmptyValue: true,
    required: false,
    type: () => Number,
  },
]

export const PRODUCT_CATEGORY_DOC_APP_PARAM_LIST = []

export const PRODUCT_CATEGORY_DOC_ADMIN_QUERY_LIST = []
export const PRODUCT_CATEGORY_DOC_ADMIN_PARAM_DETAIL = [
  {
    name: 'id',
    allowEmptyValue: false,
    required: true,
    type: () => Number,
  },
]
