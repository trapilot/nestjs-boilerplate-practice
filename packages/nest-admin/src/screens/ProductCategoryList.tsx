/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { useNavigate } from 'react-router-dom'
import { GenericList } from '../components/GenericList'
import { productCategoryService } from '../services'

export default function ProductCategoryList() {
  const navigate = useNavigate()

  return (
    <GenericList
      module="product-category"
      subject="PRODUCT_CATEGORY"
      actions={{
        onList: productCategoryService.list,
        onRead: (row) => navigate(`/product-category/${row.id}/view`),
        onCreate: productCategoryService.create,
        onUpdate: (row) => navigate(`/product-category/${row.id}/edit`),
        onDelete: productCategoryService.delete,
      }}
    />
  )
}
