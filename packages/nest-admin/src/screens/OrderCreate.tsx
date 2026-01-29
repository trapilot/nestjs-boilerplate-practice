/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/order-request-create-dto.schema'
import { orderService } from '../services/order.service.ts'
import { FormPage } from '../components/FormPage'

export default function OrderCreate() {
  return (
    <FormPage
      schema={formSchema}
      onSubmit={orderService.create}
    />
  )
}

