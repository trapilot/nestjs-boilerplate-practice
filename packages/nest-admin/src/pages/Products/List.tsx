import { GenericList } from '../../components/Table/GenericList'
import { productService } from '../../services/product.service'

export default function ProductsList() {
  return (
    <GenericList
      module="product"
      fetcher={(options) => productService.list(options)}
      columns={[
        'id',
        'brandId',
        'categoryId',
        'sku',
        'name',
        'salePoint',
        'salePrice',
        'costPrice',
        'stockQty',
        'paidQty',
        'unpaidQty',
        'sorting',
        'hasShipment',
        'hasInventory',
        'hasExpiration',
        'hasDuePayment',
        'hasLimitPerson',
        'isPopular',
        'isBestSale',
        'isFlashSale',
        'isComingSoon',
        'isNewArrival',
        'isActive',
        'isDeleted',
        'createdAt',
        'updatedAt',
        'createdBy',
        'updatedBy',
      ]}
    />
  )
}
