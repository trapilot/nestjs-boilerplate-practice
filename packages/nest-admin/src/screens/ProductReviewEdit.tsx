/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/product-review-request-update-dto.schema'
import { productReviewService } from '../services/product-review.service.ts'
import { FormPage } from '../components/FormPage'
import { Navigate, useParams } from 'react-router-dom'

export default function ProductReviewEdit() {
   const { id } = useParams<{ id: string }>()

  if (!id) {
     return <Navigate to="/404" replace />
  }

  return (
    <FormPage
      schema={formSchema}
      onLoad={() => productReviewService.get({ id })}
      onSubmit={(data) => productReviewService.update({ id }, data)}
    />
  )
}

