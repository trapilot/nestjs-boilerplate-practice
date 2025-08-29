import { GenericList } from '../../components/Table/GenericList'
import { invoiceService } from '../../services/invoice.service'

export default function InvoicesList() {
  return <GenericList module="invoice" fetcher={(options) => invoiceService.list(options)} />
}
