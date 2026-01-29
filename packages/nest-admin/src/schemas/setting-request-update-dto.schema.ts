/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { FormSchema } from '../types/form'

const schema: FormSchema = {
  "title": "SettingRequestUpdateDto",
  "fields": {
    "description": {
      "type": "string",
      "format": "string",
      "placeholder": "",
      "required": false
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
