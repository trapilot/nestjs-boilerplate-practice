/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/product-category-request-update-dto.schema'
import { productCategoryService } from '../services/product-category.service.ts'
import { FormPage } from '../components/FormPage'
import { Navigate, useParams } from 'react-router-dom'

export default function ProductCategoryEdit() {
   const { id } = useParams<{ id: string }>()

  if (!id) {
     return <Navigate to="/404" replace />
  }

  return (
    <FormPage
      schema={formSchema}
      onLoad={() => productCategoryService.get({ id })}
      onSubmit={(data) => productCategoryService.update({ id }, data)}
    />
  )
}

