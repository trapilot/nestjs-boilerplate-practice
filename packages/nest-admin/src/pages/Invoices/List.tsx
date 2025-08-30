import { GenericList } from '../../components/Table/GenericList'
import { invoiceService } from '../../services/invoice.service'

export default function InvoicesList() {
  return (
    <GenericList
      module="invoice"
      fetcher={(options) => invoiceService.list(options)}
      columns={[
        'id',
        'code',
        'memberId',
        'orderId',
        'promotionId',
        'invoiceRef',
        'invoicePath',
        'paidPrice',
        'paidPoint',
        'finalPrice',
        'finalPoint',
        'status',
        'isBirth',
        'isEarned',
        'dueDate',
        'issueDate',
        'issuedAt',
        'createdAt',
        'updatedAt',
      ]}
    />
  )
}
