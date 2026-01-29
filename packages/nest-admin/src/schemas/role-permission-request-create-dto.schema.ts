/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { FormSchema } from '../types/form'

const schema: FormSchema = {
  "title": "RolePermissionRequestCreateDto",
  "fields": {
    "subject": {
      "type": "string",
      "format": "string",
      "placeholder": "",
      "required": true
    },
    "actions": {
      "type": "array",
      "format": "array",
      "placeholder": "",
      "required": true
    }
  }
}

export default schema
