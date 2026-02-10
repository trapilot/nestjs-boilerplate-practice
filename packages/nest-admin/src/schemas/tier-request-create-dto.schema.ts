/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { FormSchema } from '../types/form'

const schema: FormSchema = {
  "title": "TierRequestCreateDto",
  "fields": {
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
    "code": {
      "type": "string",
      "format": "enum",
      "placeholder": "",
      "required": true,
      "options": [
        "NORMAL",
        "BRONZE",
        "SILVER",
        "GOLD",
        "BLACK",
        "PLATINUM",
        "DIAMOND"
      ]
    },
    "description": {
      "type": "object",
      "format": "string",
      "placeholder": "",
      "required": true,
      "options": [
        "en",
        "vi"
      ]
    }
  }
}

export default schema
