/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/product-category-request-create-dto.schema'
import { productCategoryService } from '../services/product-category.service.ts'
import { FormPage } from '../components/FormPage'

export default function ProductCategoryCreate() {
  return (
    <FormPage
      schema={formSchema}
      onSubmit={productCategoryService.create}
    />
  )
}

