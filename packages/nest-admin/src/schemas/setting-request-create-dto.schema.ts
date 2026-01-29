/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { FormSchema } from '../types/form'

const schema: FormSchema = {
  "title": "SettingRequestCreateDto",
  "fields": {
    "code": {
      "type": "string",
      "format": "string",
      "placeholder": "",
      "required": true
    },
    "name": {
      "type": "string",
      "format": "string",
      "placeholder": "",
      "required": true
    },
    "group": {
      "type": "string",
      "format": "enum",
      "placeholder": "",
      "required": true,
      "options": [
        "system",
        "app_version"
      ]
    },
    "description": {
      "type": "string",
      "format": "string",
      "placeholder": "",
      "required": false
    },
    "type": {
      "type": "string",
      "format": "enum",
      "placeholder": "",
      "required": true,
      "options": [
        "boolean",
        "number",
        "string",
        "array",
        "json"
      ]
    },
    "value": {
      "type": "string",
      "format": "string",
      "placeholder": "",
      "required": true
    },
    "refer": {
      "type": "string",
      "format": "string",
      "placeholder": "",
      "required": true,
      "nullable": true
    }
  }
}

export default schema
