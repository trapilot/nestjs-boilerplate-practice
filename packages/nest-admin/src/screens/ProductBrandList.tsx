/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { useNavigate } from 'react-router-dom'
import { GenericList } from '../components/GenericList'
import { productBrandService } from '../services'

export default function ProductBrandList() {
  const navigate = useNavigate()

  return (
    <GenericList
      module="product-brand"
      subject="PRODUCT_BRAND"
      actions={{
        onList: productBrandService.list,
        onRead: (row) => navigate(`/product-brand/${row.id}/view`),
        onCreate: productBrandService.create,
        onUpdate: (row) => navigate(`/product-brand/${row.id}/edit`),
        onDelete: productBrandService.delete,
      }}
    />
  )
}
