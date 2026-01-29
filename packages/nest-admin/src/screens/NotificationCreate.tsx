/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/notification-request-create-dto.schema'
import { notificationService } from '../services/notification.service.ts'
import { FormPage } from '../components/FormPage'

export default function NotificationCreate() {
  return (
    <FormPage
      schema={formSchema}
      onSubmit={notificationService.create}
    />
  )
}

