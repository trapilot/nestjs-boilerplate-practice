import { GenericList } from '../../components/Table/GenericList'
import { notificationService } from '../../services/notification.service'

export default function MemberNotificationsList() {
  return (
    <GenericList
      module="member_notification"
      fetcher={(options) => notificationService.list(options)}
    />
  )
}
