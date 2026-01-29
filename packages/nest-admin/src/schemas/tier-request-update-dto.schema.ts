/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { FormSchema } from '../types/form'

const schema: FormSchema = {
  "title": "TierRequestUpdateDto",
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
    "rewardPoint": {
      "type": "number",
      "format": "number",
      "placeholder": "",
      "required": true
    },
    "birthdayRatio": {
      "type": "number",
      "format": "number",
      "placeholder": "",
      "required": true
    },
    "limitAmount": {
      "type": "number",
      "format": "number",
      "placeholder": "",
      "required": true
    },
    "initialRate": {
      "type": "number",
      "format": "number",
      "placeholder": "",
      "required": true
    },
    "personalRate": {
      "type": "number",
      "format": "number",
      "placeholder": "",
      "required": true
    },
    "referralRate": {
      "type": "number",
      "format": "number",
      "placeholder": "",
      "required": true
    }
  }
}

export default schema
