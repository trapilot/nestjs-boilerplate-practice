/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { FormSchema } from '../types/form'

const schema: FormSchema = {
  "title": "ProductReviewRequestUpdateDto",
  "fields": {
    "productId": {
      "type": "number",
      "format": "number",
      "placeholder": "",
      "required": true
    },
    "memberId": {
      "type": "number",
      "format": "number",
      "placeholder": "",
      "required": true
    },
    "comment": {
      "type": "string",
      "format": "string",
      "placeholder": "",
      "required": true
    }
  }
}

export default schema
