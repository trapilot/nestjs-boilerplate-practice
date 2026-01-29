/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { useNavigate } from 'react-router-dom'
import { GenericList } from '../components/GenericList'
import { memberService } from '../services'

export default function MemberList() {
  const navigate = useNavigate()

  return (
    <GenericList
      module="member"
      subject="MEMBER"
      actions={{
        onList: memberService.list,
        onRead: (row) => navigate(`/member/${row.id}/view`),
        onCreate: memberService.create,
        onUpdate: (row) => navigate(`/member/${row.id}/edit`),
        onDelete: () => {},
      }}
    />
  )
}
