import { GenericList } from '../../components/Table/GenericList'
import { orderService } from '../../services/order.service'

export default function OrdersList() {
  return (
    <GenericList
      module="order"
      fetcher={(options) => orderService.list(options)}
      columns={[
        'id',
        'code',
        'memberId',
        'promotionId',
        'totalPrice',
        'totalPoint',
        'discPrice',
        'discPoint',
        'finalPrice',
        'finalPoint',
        'source',
        'status',
        'isBirth',
        'issueDate',
        'issuedAt',
        'createdAt',
        'updatedAt',
      ]}
    />
  )
}
