import { GenericList } from '../../components/Table/GenericList'
import { productService } from '../../services/product.service'

export default function ProductsList() {
  return <GenericList module="product" fetcher={(options) => productService.list(options)} />
}
