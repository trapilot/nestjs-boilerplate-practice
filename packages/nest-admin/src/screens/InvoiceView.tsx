/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { useNavigate } from 'react-router-dom'
import { GenericList } from '../components/GenericList'
import { invoiceService } from '../services'

export default function InvoiceView() {
  const navigate = useNavigate()

  return (
    <GenericList
      module="invoice"
      subject="INVOICE"
      actions={{
        onList: invoiceService.list,
        onRead: (row) => navigate(`/invoice/${row.id}/view`),
        onCreate: invoiceService.create,
        onUpdate: (row) => navigate(`/invoice/${row.id}/edit`),
        onDelete: invoiceService.delete,
      }}
    />
  )
}
