/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { useNavigate } from 'react-router-dom'
import { GenericList } from '../components/GenericList'
import { productService } from '../services'

export default function ProductView() {
  const navigate = useNavigate()

  return (
    <GenericList
      module="product"
      subject="PRODUCT"
      actions={{
        onList: productService.list,
        onRead: (row) => navigate(`/product/${row.id}/view`),
        onCreate: productService.create,
        onUpdate: (row) => navigate(`/product/${row.id}/edit`),
        onDelete: productService.delete,
      }}
    />
  )
}
