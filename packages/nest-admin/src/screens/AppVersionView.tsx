/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { useNavigate } from 'react-router-dom'
import { GenericList } from '../components/GenericList'
import { appVersionService } from '../services'

export default function AppVersionView() {
  const navigate = useNavigate()

  return (
    <GenericList
      module="app-version"
      subject="APP_VERSION"
      actions={{
        onList: appVersionService.list,
        onRead: (row) => navigate(`/app-version/${row.id}/view`),
        onCreate: appVersionService.create,
        onUpdate: (row) => navigate(`/app-version/${row.id}/edit`),
        onDelete: appVersionService.delete,
      }}
    />
  )
}
