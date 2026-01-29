/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { useNavigate } from 'react-router-dom'
import { GenericList } from '../components/GenericList'
import { memberTierService } from '../services'

export default function MemberTierList() {
  const navigate = useNavigate()

  return (
    <GenericList
      module="member-tier"
      subject="MEMBER_TIER"
      actions={{
        onList: memberTierService.list,
        onRead: (row) => navigate(`/member-tier/${row.id}/view`),
        onCreate: memberTierService.create,
        onUpdate: (row) => navigate(`/member-tier/${row.id}/edit`),
        onDelete: memberTierService.delete,
      }}
    />
  )
}
