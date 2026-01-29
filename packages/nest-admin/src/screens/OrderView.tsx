/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { useNavigate } from 'react-router-dom'
import { GenericList } from '../components/GenericList'
import { orderService } from '../services'

export default function OrderView() {
  const navigate = useNavigate()

  return (
    <GenericList
      module="order"
      subject="ORDER"
      actions={{
        onList: orderService.list,
        onRead: (row) => navigate(`/order/${row.id}/view`),
        onCreate: orderService.create,
        onUpdate: (row) => navigate(`/order/${row.id}/edit`),
        onDelete: orderService.delete,
      }}
    />
  )
}
