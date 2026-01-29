/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { useNavigate } from 'react-router-dom'
import { GenericList } from '../components/GenericList'
import { settingService } from '../services'

export default function SettingList() {
  const navigate = useNavigate()

  return (
    <GenericList
      module="setting"
      subject="SETTING"
      actions={{
        onList: settingService.list,
        onRead: (row) => navigate(`/setting/${row.id}/view`),
        onCreate: settingService.create,
        onUpdate: (row) => navigate(`/setting/${row.id}/edit`),
        onDelete: () => {},
      }}
    />
  )
}
