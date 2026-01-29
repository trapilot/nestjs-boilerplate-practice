/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { FormSchema } from '../types/form'

const schema: FormSchema = {
  "title": "PageRequestCreateDto",
  "fields": {
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
    "content": {
      "type": "object",
      "format": "string",
      "placeholder": "",
      "required": true,
      "options": [
        "en",
        "vi"
      ]
    },
    "type": {
      "type": "string",
      "format": "enum",
      "placeholder": "",
      "required": true,
      "options": [
        "ABOUT_US",
        "PRIVACY",
        "TERM_AND_CONDITION"
      ]
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
