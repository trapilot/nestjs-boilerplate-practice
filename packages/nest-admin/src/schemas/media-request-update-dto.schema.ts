/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { FormSchema } from '../types/form'

const schema: FormSchema = {
  "title": "MediaRequestUpdateDto",
  "fields": {
    "type": {
      "type": "string",
      "format": "enum",
      "placeholder": "",
      "required": true,
      "options": [
        "BANNER",
        "SLIDER"
      ]
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
    "brief": {
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
    "refType": {
      "type": "string",
      "format": "enum",
      "placeholder": "",
      "required": false,
      "options": [
        "text"
      ]
    },
    "refValue": {
      "type": "string",
      "format": "string",
      "placeholder": "",
      "required": false
    },
    "isActive": {
      "type": "boolean",
      "format": "boolean",
      "placeholder": "",
      "required": false
    },
    "url": {
      "type": "string",
      "format": "binary",
      "placeholder": "",
      "required": false
    }
  }
}

export default schema
