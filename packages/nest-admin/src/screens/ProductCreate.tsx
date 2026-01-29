/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/product-request-create-dto.schema'
import { productService } from '../services/product.service.ts'
import { FormPage } from '../components/FormPage'

export default function ProductCreate() {
  return (
    <FormPage
      schema={formSchema}
      onSubmit={productService.create}
    />
  )
}

