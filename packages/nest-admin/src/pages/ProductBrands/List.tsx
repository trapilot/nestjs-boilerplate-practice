import { GenericList } from '../../components/Table/GenericList'
import { productBrandService } from '../../services/product-brand.service'

export default function ProductBrandsList() {
  return (
    <GenericList module="product_brand" fetcher={(options) => productBrandService.list(options)} />
  )
}
