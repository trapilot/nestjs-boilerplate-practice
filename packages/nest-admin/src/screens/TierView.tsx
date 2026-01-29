/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { useNavigate } from 'react-router-dom'
import { GenericList } from '../components/GenericList'
import { tierService } from '../services'

export default function TierView() {
  const navigate = useNavigate()

  return (
    <GenericList
      module="tier"
      subject="TIER"
      actions={{
        onList: tierService.list,
        onRead: (row) => navigate(`/tier/${row.id}/view`),
        onCreate: tierService.create,
        onUpdate: (row) => navigate(`/tier/${row.id}/edit`),
        onDelete: tierService.delete,
      }}
    />
  )
}
