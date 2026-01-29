/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/user-request-update-dto.schema'
import { userService } from '../services/user.service.ts'
import { FormPage } from '../components/FormPage'
import { Navigate, useParams } from 'react-router-dom'

export default function UserEdit() {
   const { id } = useParams<{ id: string }>()

  if (!id) {
     return <Navigate to="/404" replace />
  }

  return (
    <FormPage
      schema={formSchema}
      onLoad={() => userService.get({ id })}
      onSubmit={(data) => userService.update({ id }, data)}
    />
  )
}

