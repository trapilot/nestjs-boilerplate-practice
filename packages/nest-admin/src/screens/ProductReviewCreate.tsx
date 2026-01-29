/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/product-review-request-create-dto.schema'
import { productReviewService } from '../services/product-review.service.ts'
import { FormPage } from '../components/FormPage'

export default function ProductReviewCreate() {
  return (
    <FormPage
      schema={formSchema}
      onSubmit={productReviewService.create}
    />
  )
}

