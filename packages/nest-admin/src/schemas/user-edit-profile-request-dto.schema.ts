/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { FormSchema } from '../types/form'

const schema: FormSchema = {
  "title": "UserEditProfileRequestDto",
  "fields": {
    "email": {
      "type": "string",
      "format": "string",
      "placeholder": "",
      "required": true
    },
    "phone": {
      "type": "string",
      "format": "string",
      "placeholder": "",
      "required": false
    },
    "name": {
      "type": "string",
      "format": "string",
      "placeholder": "",
      "required": true
    },
    "address": {
      "type": "string",
      "format": "string",
      "placeholder": "",
      "required": true
    },
    "isActive": {
      "type": "boolean",
      "format": "boolean",
      "placeholder": "",
      "required": true
    },
    "roleId": {
      "type": "number",
      "format": "number",
      "placeholder": "",
      "required": true
    }
  }
}

export default schema
