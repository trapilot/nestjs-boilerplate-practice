/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { useNavigate } from 'react-router-dom'
import { GenericList } from '../components/GenericList'
import { memberPointService } from '../services'

export default function MemberPointView() {
  const navigate = useNavigate()

  return (
    <GenericList
      module="member-point"
      subject="MEMBER_POINT"
      actions={{
        onList: memberPointService.list,
        onRead: (row) => navigate(`/member-point/${row.id}/view`),
        onCreate: memberPointService.create,
        onUpdate: (row) => navigate(`/member-point/${row.id}/edit`),
        onDelete: memberPointService.delete,
      }}
    />
  )
}
