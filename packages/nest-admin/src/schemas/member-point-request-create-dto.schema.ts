/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { FormSchema } from '../types/form'

const schema: FormSchema = {
  "title": "MemberPointRequestCreateDto",
  "fields": {
    "memberId": {
      "type": "number",
      "format": "number",
      "placeholder": "",
      "required": true
    },
    "point": {
      "type": "number",
      "format": "number",
      "placeholder": "",
      "required": true
    },
    "reason": {
      "type": "string",
      "format": "enum",
      "placeholder": "",
      "required": true,
      "options": [
        "IMPORT",
        "PURCHASE",
        "REFER",
        "SHARE",
        "REWARD",
        "WELCOME",
        "REGISTER",
        "UPGRADE",
        "RENEWAL",
        "ADJUST",
        "EXPIRE"
      ]
    },
    "action": {
      "type": "string",
      "format": "enum",
      "placeholder": "",
      "required": true,
      "options": [
        "PLUS",
        "DEDUCT"
      ]
    }
  }
}

export default schema
