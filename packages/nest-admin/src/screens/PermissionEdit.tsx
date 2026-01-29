/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/permission-request-update-dto.schema'
import { permissionService } from '../services/permission.service.ts'
import { FormPage } from '../components/FormPage'
import { Navigate, useParams } from 'react-router-dom'

export default function PermissionEdit() {
   const { id } = useParams<{ id: string }>()

  if (!id) {
     return <Navigate to="/404" replace />
  }

  return (
    <FormPage
      schema={formSchema}
      onLoad={() => permissionService.get({ id })}
      onSubmit={(data) => permissionService.update({ id }, data)}
    />
  )
}

