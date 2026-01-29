/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { FormSchema } from '../types/form'

const schema: FormSchema = {
  "title": "ApiKeyRequestCreateDto",
  "fields": {
    "type": {
      "type": "string",
      "format": "enum",
      "placeholder": "",
      "required": true,
      "options": [
        "SYSTEM",
        "CLIENT",
        "DEFAULT"
      ]
    },
    "name": {
      "type": "string",
      "format": "string",
      "placeholder": "",
      "required": true
    },
    "startDate": {
      "type": "string",
      "format": "date-time",
      "placeholder": "",
      "required": false
    },
    "untilDate": {
      "type": "string",
      "format": "date-time",
      "placeholder": "",
      "required": false
    }
  }
}

export default schema
