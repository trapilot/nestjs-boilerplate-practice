import { GenericList } from '../../components/Table/GenericList'
import { notificationService } from '../../services/notification.service'

export default function NotificationsList() {
  return (
    <GenericList module="notification" fetcher={(options) => notificationService.list(options)} />
  )
}
