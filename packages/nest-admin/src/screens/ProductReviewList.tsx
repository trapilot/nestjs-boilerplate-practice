/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { useNavigate } from 'react-router-dom'
import { GenericList } from '../components/GenericList'
import { productReviewService } from '../services'

export default function ProductReviewList() {
  const navigate = useNavigate()

  return (
    <GenericList
      module="product-review"
      subject="PRODUCT_REVIEW"
      actions={{
        onList: productReviewService.list,
        onRead: (row) => navigate(`/product-review/${row.id}/view`),
        onCreate: productReviewService.create,
        onUpdate: (row) => navigate(`/product-review/${row.id}/edit`),
        onDelete: productReviewService.delete,
      }}
    />
  )
}
