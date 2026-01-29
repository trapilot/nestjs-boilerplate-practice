/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { useNavigate } from 'react-router-dom'
import { GenericList } from '../components/GenericList'
import { roleService } from '../services'

export default function RoleView() {
  const navigate = useNavigate()

  return (
    <GenericList
      module="role"
      subject="ROLE"
      actions={{
        onList: roleService.list,
        onRead: (row) => navigate(`/role/${row.id}/view`),
        onCreate: roleService.create,
        onUpdate: (row) => navigate(`/role/${row.id}/edit`),
        onDelete: roleService.delete,
      }}
    />
  )
}
