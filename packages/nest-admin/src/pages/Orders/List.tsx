import { GenericList } from '../../components/Table/GenericList'
import { orderService } from '../../services/order.service'

export default function OrdersList() {
  return <GenericList module="order" fetcher={(options) => orderService.list(options)} />
}
