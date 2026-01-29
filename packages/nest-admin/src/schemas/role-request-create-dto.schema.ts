/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { FormSchema } from '../types/form'

const schema: FormSchema = {
  "title": "RoleRequestCreateDto",
  "fields": {
    "title": {
      "type": "string",
      "format": "string",
      "placeholder": "",
      "required": true
    },
    "description": {
      "type": "string",
      "format": "string",
      "placeholder": "",
      "required": false
    },
    "isActive": {
      "type": "boolean",
      "format": "boolean",
      "placeholder": "",
      "required": true
    },
    "permissions": {
      "type": "array",
      "format": "array",
      "placeholder": "",
      "required": true
    }
  }
}

export default schema
