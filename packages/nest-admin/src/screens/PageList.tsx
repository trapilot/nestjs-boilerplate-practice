/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { useNavigate } from 'react-router-dom'
import { GenericList } from '../components/GenericList'
import { pageService } from '../services'

export default function PageList() {
  const navigate = useNavigate()

  return (
    <GenericList
      module="page"
      subject="PAGE"
      actions={{
        onList: pageService.list,
        onRead: (row) => navigate(`/page/${row.id}/view`),
        onCreate: pageService.create,
        onUpdate: (row) => navigate(`/page/${row.id}/edit`),
        onDelete: pageService.delete,
      }}
    />
  )
}
