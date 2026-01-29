/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/product-brand-request-update-dto.schema'
import { productBrandService } from '../services/product-brand.service.ts'
import { FormPage } from '../components/FormPage'
import { Navigate, useParams } from 'react-router-dom'

export default function ProductBrandEdit() {
   const { id } = useParams<{ id: string }>()

  if (!id) {
     return <Navigate to="/404" replace />
  }

  return (
    <FormPage
      schema={formSchema}
      onLoad={() => productBrandService.get({ id })}
      onSubmit={(data) => productBrandService.update({ id }, data)}
    />
  )
}

