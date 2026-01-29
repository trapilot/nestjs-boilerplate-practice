/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { FormSchema } from '../types/form'

const schema: FormSchema = {
  "title": "UserRequestChangePasswordDto",
  "fields": {
    "newPassword": {
      "type": "string",
      "format": "string",
      "placeholder": "",
      "required": true
    },
    "oldPassword": {
      "type": "string",
      "format": "string",
      "placeholder": "",
      "required": true
    }
  }
}

export default schema
