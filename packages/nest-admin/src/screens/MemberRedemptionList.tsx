/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { useNavigate } from 'react-router-dom'
import { GenericList } from '../components/GenericList'
import { memberRedemptionService } from '../services'

export default function MemberRedemptionList() {
  const navigate = useNavigate()

  return (
    <GenericList
      module="member-redemption"
      subject="MEMBER_REDEMPTION"
      actions={{
        onList: memberRedemptionService.list,
        onRead: (row) => navigate(`/member-redemption/${row.id}/view`),
        onCreate: memberRedemptionService.create,
        onUpdate: (row) => navigate(`/member-redemption/${row.id}/edit`),
        onDelete: memberRedemptionService.delete,
      }}
    />
  )
}
