export const PRODUCT_DOC_OPERATION = 'Product'

export const PRODUCT_DOC_ADMIN_QUERY_LIST = [
  {
    name: 'isActive',
    allowEmptyValue: true,
    required: false,
    type: 'boolean',
  },
  {
    name: 'price',
    allowEmptyValue: true,
    required: false,
    type: 'string',
    example: '0-2000',
  },
]

export const PRODUCT_DOC_ADMIN_PARAM_GET = [
  {
    name: 'id',
    allowEmptyValue: false,
    required: true,
    type: 'number',
    example: 1,
  },
]

export const PRODUCT_DOC_APP_QUERY_LIST = [
  {
    name: 'brandId',
    required: false,
    type: 'number',
  },
  {
    name: 'categoryId',
    required: false,
    type: 'number',
  },
  {
    name: 'isWishlist',
    required: false,
    type: 'boolean',
  },
  {
    name: 'isPopular',
    required: false,
    type: 'boolean',
  },
]
