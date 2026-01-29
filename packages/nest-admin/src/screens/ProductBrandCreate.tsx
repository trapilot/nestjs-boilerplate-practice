/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/product-brand-request-create-dto.schema'
import { productBrandService } from '../services/product-brand.service.ts'
import { FormPage } from '../components/FormPage'

export default function ProductBrandCreate() {
  return (
    <FormPage
      schema={formSchema}
      onSubmit={productBrandService.create}
    />
  )
}

