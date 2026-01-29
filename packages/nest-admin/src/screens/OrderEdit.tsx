/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/order-request-update-dto.schema'
import { orderService } from '../services/order.service.ts'
import { FormPage } from '../components/FormPage'
import { Navigate, useParams } from 'react-router-dom'

export default function OrderEdit() {
   const { id } = useParams<{ id: string }>()

  if (!id) {
     return <Navigate to="/404" replace />
  }

  return (
    <FormPage
      schema={formSchema}
      onLoad={() => orderService.get({ id })}
      onSubmit={(data) => orderService.update({ id }, data)}
    />
  )
}

