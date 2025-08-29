import { GenericList } from '../../components/Table/GenericList'
import { productCategoryService } from '../../services/product-category.service'

export default function ProductCategoriesList() {
  return (
    <GenericList
      module="product_category"
      fetcher={(options) => productCategoryService.list(options)}
    />
  )
}
