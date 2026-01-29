/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/invoice-request-create-dto.schema'
import { invoiceService } from '../services/invoice.service.ts'
import { FormPage } from '../components/FormPage'

export default function InvoiceCreate() {
  return (
    <FormPage
      schema={formSchema}
      onSubmit={invoiceService.create}
    />
  )
}

