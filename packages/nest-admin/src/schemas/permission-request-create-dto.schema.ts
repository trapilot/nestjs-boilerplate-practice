/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { FormSchema } from '../types/form'

const schema: FormSchema = {
  "title": "PermissionRequestCreateDto",
  "fields": {
    "context": {
      "type": "string",
      "format": "enum",
      "placeholder": "",
      "required": false,
      "options": [
        "DASHBOARD",
        "SETTING_MANAGEMENT",
        "USER_MANAGEMENT",
        "MEMBER_MANAGEMENT",
        "CATALOG_MANAGEMENT",
        "SALES_MANAGEMENT",
        "LOCATION_MANAGEMENT",
        "MARKETING_MANAGEMENT",
        "MEDIA_MANAGEMENT"
      ]
    },
    "subject": {
      "type": "string",
      "format": "enum",
      "placeholder": "",
      "required": true,
      "options": [
        "DASHBOARD",
        "SETTING",
        "MEDIA",
        "API_KEY",
        "APP_VERSION",
        "ROLE",
        "PERMISSION",
        "USER",
        "PAGE",
        "COUNTRY",
        "DISTRICT",
        "PUSH",
        "PUSH_GROUP",
        "NOTIFICATION",
        "POINT_SCHEMA",
        "MEMBER",
        "MEMBER_TIER",
        "MEMBER_POINT",
        "MEMBER_PUSH",
        "MEMBER_NOTIFICATION",
        "MEMBER_REDEMPTION",
        "PRODUCT",
        "PRODUCT_BRAND",
        "PRODUCT_CATEGORY",
        "PRODUCT_REVIEW",
        "CART",
        "ORDER",
        "INVOICE",
        "PAYMENT",
        "TIER"
      ]
    },
    "actions": {
      "type": "array",
      "format": "array",
      "placeholder": "",
      "required": true
    },
    "path": {
      "type": "string",
      "format": "string",
      "placeholder": "",
      "required": true
    },
    "title": {
      "type": "object",
      "format": "string",
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
    "isVisible": {
      "type": "boolean",
      "format": "boolean",
      "placeholder": "",
      "required": true
    },
    "isActive": {
      "type": "boolean",
      "format": "boolean",
      "placeholder": "",
      "required": true
    }
  }
}

export default schema
