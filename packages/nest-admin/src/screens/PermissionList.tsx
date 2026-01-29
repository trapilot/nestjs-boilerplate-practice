/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { useNavigate } from 'react-router-dom'
import { GenericList } from '../components/GenericList'
import { permissionService } from '../services'

export default function PermissionList() {
  const navigate = useNavigate()

  return (
    <GenericList
      module="permission"
      subject="PERMISSION"
      actions={{
        onList: permissionService.list,
        onRead: (row) => navigate(`/permission/${row.id}/view`),
        onCreate: permissionService.create,
        onUpdate: (row) => navigate(`/permission/${row.id}/edit`),
        onDelete: () => {},
      }}
    />
  )
}
