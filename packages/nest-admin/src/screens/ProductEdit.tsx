/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/product-request-update-dto.schema'
import { productService } from '../services/product.service.ts'
import { FormPage } from '../components/FormPage'
import { Navigate, useParams } from 'react-router-dom'

export default function ProductEdit() {
   const { id } = useParams<{ id: string }>()

  if (!id) {
     return <Navigate to="/404" replace />
  }

  return (
    <FormPage
      schema={formSchema}
      onLoad={() => productService.get({ id })}
      onSubmit={(data) => productService.update({ id }, data)}
    />
  )
}

