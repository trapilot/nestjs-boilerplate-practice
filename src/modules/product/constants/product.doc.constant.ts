export const PRODUCT_DOC_OPERATION = 'Product'

export const PRODUCT_DOC_ADMIN_QUERY_LIST = [
  {
    name: 'isActive',
    allowEmptyValue: true,
    required: false,
    type: () => Boolean,
  },
  {
    name: 'price',
    allowEmptyValue: true,
    required: false,
    type: () => String,
    example: '0-2000',
  },
]

export const PRODUCT_DOC_ADMIN_PARAM_GET = [
  {
    name: 'id',
    allowEmptyValue: false,
    required: true,
    type: () => Number,
    example: 1,
  },
]

export const PRODUCT_DOC_APP_QUERY_LIST = [
  {
    name: 'brandId',
    required: false,
    type: () => Number,
  },
  {
    name: 'categoryId',
    required: false,
    type: () => Number,
  },
  {
    name: 'isWishlist',
    required: false,
    type: () => Boolean,
  },
  {
    name: 'isPopular',
    required: false,
    type: () => Boolean,
  },
]
