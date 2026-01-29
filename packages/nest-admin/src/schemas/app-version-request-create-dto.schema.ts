/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { FormSchema } from '../types/form'

const schema: FormSchema = {
  "title": "AppVersionRequestCreateDto",
  "fields": {
    "type": {
      "type": "string",
      "format": "enum",
      "placeholder": "",
      "required": true,
      "options": [
        "IOS",
        "AOS",
        "WEB"
      ]
    },
    "name": {
      "type": "string",
      "format": "string",
      "placeholder": "",
      "required": true
    },
    "version": {
      "type": "string",
      "format": "string",
      "placeholder": "",
      "required": true
    },
    "url": {
      "type": "string",
      "format": "string",
      "placeholder": "",
      "required": true
    }
  }
}

export default schema
