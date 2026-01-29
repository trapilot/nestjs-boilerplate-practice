/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/invoice-request-update-dto.schema'
import { invoiceService } from '../services/invoice.service.ts'
import { FormPage } from '../components/FormPage'
import { Navigate, useParams } from 'react-router-dom'

export default function InvoiceEdit() {
   const { id } = useParams<{ id: string }>()

  if (!id) {
     return <Navigate to="/404" replace />
  }

  return (
    <FormPage
      schema={formSchema}
      onLoad={() => invoiceService.get({ id })}
      onSubmit={(data) => invoiceService.update({ id }, data)}
    />
  )
}

