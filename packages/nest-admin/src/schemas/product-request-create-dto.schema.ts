/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { FormSchema } from '../types/form'

const schema: FormSchema = {
  "title": "ProductRequestCreateDto",
  "fields": {
    "brandId": {
      "type": "number",
      "format": "number",
      "placeholder": "",
      "required": true
    },
    "categoryId": {
      "type": "number",
      "format": "number",
      "placeholder": "",
      "required": true
    },
    "sku": {
      "type": "string",
      "format": "string",
      "placeholder": "",
      "required": true
    },
    "name": {
      "type": "object",
      "format": "string",
      "placeholder": "",
      "required": true,
      "options": [
        "en",
        "vi"
      ]
    },
    "termAndCond": {
      "type": "object",
      "format": "html",
      "placeholder": "",
      "required": true,
      "options": [
        "en",
        "vi"
      ]
    },
    "content": {
      "type": "object",
      "format": "html",
      "placeholder": "",
      "required": true,
      "options": [
        "en",
        "vi"
      ]
    },
    "sorting": {
      "type": "number",
      "format": "number",
      "placeholder": "",
      "required": true
    },
    "salePoint": {
      "type": "number",
      "format": "number",
      "placeholder": "",
      "required": true
    },
    "salePrice": {
      "type": "number",
      "format": "number",
      "placeholder": "",
      "required": true
    },
    "costPrice": {
      "type": "number",
      "format": "number",
      "placeholder": "",
      "required": true
    },
    "stockQty": {
      "type": "number",
      "format": "number",
      "placeholder": "",
      "required": true
    },
    "salePerPerson": {
      "type": "number",
      "format": "number",
      "placeholder": "",
      "required": true
    },
    "duePaidDays": {
      "type": "number",
      "format": "number",
      "placeholder": "",
      "required": true
    },
    "expiryType": {
      "type": "string",
      "format": "enum",
      "placeholder": "",
      "required": true,
      "options": [
        "STATIC",
        "DYNAMIC"
      ]
    },
    "dynamicExpiryDays": {
      "type": "number",
      "format": "number",
      "placeholder": "",
      "required": false
    },
    "staticExpiryDate": {
      "type": "string",
      "format": "date-time",
      "placeholder": "",
      "required": false
    },
    "hasShipment": {
      "type": "boolean",
      "format": "boolean",
      "placeholder": "",
      "required": false
    },
    "hasInventory": {
      "type": "boolean",
      "format": "boolean",
      "placeholder": "",
      "required": false
    },
    "hasExpiration": {
      "type": "boolean",
      "format": "boolean",
      "placeholder": "",
      "required": false
    },
    "hasDuePayment": {
      "type": "boolean",
      "format": "boolean",
      "placeholder": "",
      "required": false
    },
    "hasLimitPerson": {
      "type": "boolean",
      "format": "boolean",
      "placeholder": "",
      "required": false
    },
    "isPopular": {
      "type": "boolean",
      "format": "boolean",
      "placeholder": "",
      "required": false
    },
    "isBestSale": {
      "type": "boolean",
      "format": "boolean",
      "placeholder": "",
      "required": false
    },
    "isFlashSale": {
      "type": "boolean",
      "format": "boolean",
      "placeholder": "",
      "required": false
    },
    "isComingSoon": {
      "type": "boolean",
      "format": "boolean",
      "placeholder": "",
      "required": false
    },
    "isNewArrival": {
      "type": "boolean",
      "format": "boolean",
      "placeholder": "",
      "required": false
    },
    "isActive": {
      "type": "boolean",
      "format": "boolean",
      "placeholder": "",
      "required": false
    },
    "thumbnail": {
      "type": "string",
      "format": "binary",
      "placeholder": "",
      "required": false
    }
  }
}

export default schema
