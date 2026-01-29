/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/permission-request-create-dto.schema'
import { permissionService } from '../services/permission.service.ts'
import { FormPage } from '../components/FormPage'

export default function PermissionCreate() {
  return (
    <FormPage
      schema={formSchema}
      onSubmit={permissionService.create}
    />
  )
}

