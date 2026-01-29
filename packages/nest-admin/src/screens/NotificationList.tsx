/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { useNavigate } from 'react-router-dom'
import { GenericList } from '../components/GenericList'
import { notificationService } from '../services'

export default function NotificationList() {
  const navigate = useNavigate()

  return (
    <GenericList
      module="notification"
      subject="NOTIFICATION"
      actions={{
        onList: notificationService.list,
        onRead: (row) => navigate(`/notification/${row.id}/view`),
        onCreate: notificationService.create,
        onUpdate: (row) => navigate(`/notification/${row.id}/edit`),
        onDelete: notificationService.delete,
      }}
    />
  )
}
