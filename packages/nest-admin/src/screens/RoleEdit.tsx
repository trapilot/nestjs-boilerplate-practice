/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/role-request-update-dto.schema'
import { roleService } from '../services/role.service.ts'
import { FormPage } from '../components/FormPage'
import { Navigate, useParams } from 'react-router-dom'

export default function RoleEdit() {
   const { id } = useParams<{ id: string }>()

  if (!id) {
     return <Navigate to="/404" replace />
  }

  return (
    <FormPage
      schema={formSchema}
      onLoad={() => roleService.get({ id })}
      onSubmit={(data) => roleService.update({ id }, data)}
    />
  )
}

