/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { FormSchema } from '../types/form'

const schema: FormSchema = {
  "title": "NotificationRequestCreateDto",
  "fields": {
    "channel": {
      "type": "string",
      "format": "enum",
      "placeholder": "",
      "required": true,
      "options": [
        "SMS",
        "EMAIL",
        "WHATAPP"
      ]
    },
    "type": {
      "type": "string",
      "format": "enum",
      "placeholder": "",
      "required": true,
      "options": [
        "TEXT",
        "REFERRENCE"
      ]
    },
    "refId": {
      "type": "number",
      "format": "number",
      "placeholder": "",
      "required": false
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
    "description": {
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
    "isActive": {
      "type": "boolean",
      "format": "boolean",
      "placeholder": "",
      "required": false
    },
    "pushes": {
      "type": "array",
      "format": "array",
      "placeholder": "",
      "required": false
    },
    "groupIds": {
      "type": "array",
      "format": "array",
      "placeholder": "",
      "required": false
    }
  }
}

export default schema
