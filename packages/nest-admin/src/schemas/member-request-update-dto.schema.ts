/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { FormSchema } from '../types/form'

const schema: FormSchema = {
  "title": "MemberRequestUpdateDto",
  "fields": {
    "name": {
      "type": "string",
      "format": "string",
      "placeholder": "",
      "required": true
    },
    "phone": {
      "type": "string",
      "format": "string",
      "placeholder": "",
      "required": true
    },
    "email": {
      "type": "string",
      "format": "string",
      "placeholder": "",
      "required": false
    },
    "citizenId": {
      "type": "string",
      "format": "string",
      "placeholder": "",
      "required": false
    },
    "address": {
      "type": "string",
      "format": "string",
      "placeholder": "",
      "required": false
    },
    "birthDate": {
      "type": "string",
      "format": "date-time",
      "placeholder": "",
      "required": false
    },
    "locale": {
      "type": "string",
      "format": "enum",
      "placeholder": "",
      "required": false,
      "options": [
        "en",
        "vi",
        "cn",
        "hk",
        "tw",
        "mo"
      ]
    },
    "isActive": {
      "type": "boolean",
      "format": "boolean",
      "placeholder": "",
      "required": true
    },
    "password": {
      "type": "string",
      "format": "string",
      "placeholder": "",
      "required": true
    }
  }
}

export default schema
