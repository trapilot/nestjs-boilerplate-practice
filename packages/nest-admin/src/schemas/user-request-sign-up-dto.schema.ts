/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { FormSchema } from '../types/form'

const schema: FormSchema = {
  "title": "UserRequestSignUpDto",
  "fields": {
    "email": {
      "type": "string",
      "format": "string",
      "placeholder": "",
      "required": true
    },
    "name": {
      "type": "string",
      "format": "string",
      "placeholder": "",
      "required": true
    },
    "address": {
      "type": "string",
      "format": "string",
      "placeholder": "",
      "required": true
    },
    "avatar": {
      "type": "string",
      "format": "binary",
      "placeholder": "",
      "required": false
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
