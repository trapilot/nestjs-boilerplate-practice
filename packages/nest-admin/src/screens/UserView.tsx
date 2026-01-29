/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { useNavigate } from 'react-router-dom'
import { GenericList } from '../components/GenericList'
import { userService } from '../services'

export default function UserView() {
  const navigate = useNavigate()

  return (
    <GenericList
      module="user"
      subject="USER"
      actions={{
        onList: userService.list,
        onRead: (row) => navigate(`/user/${row.id}/view`),
        onCreate: userService.create,
        onUpdate: (row) => navigate(`/user/${row.id}/edit`),
        onDelete: () => {},
      }}
    />
  )
}
