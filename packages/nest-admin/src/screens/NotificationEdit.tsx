/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/notification-request-update-dto.schema'
import { notificationService } from '../services/notification.service.ts'
import { FormPage } from '../components/FormPage'
import { Navigate, useParams } from 'react-router-dom'

export default function NotificationEdit() {
   const { id } = useParams<{ id: string }>()

  if (!id) {
     return <Navigate to="/404" replace />
  }

  return (
    <FormPage
      schema={formSchema}
      onLoad={() => notificationService.get({ id })}
      onSubmit={(data) => notificationService.update({ id }, data)}
    />
  )
}

