import { GenericList } from '../../components/Table/GenericList'
import { productReviewService } from '../../services/product-review.service'

export default function ProductReviewsList() {
  return (
    <GenericList
      module="product_review"
      fetcher={(options) => productReviewService.list(options)}
    />
  )
}
