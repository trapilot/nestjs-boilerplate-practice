/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/role-request-create-dto.schema'
import { roleService } from '../services/role.service.ts'
import { FormPage } from '../components/FormPage'

export default function RoleCreate() {
  return (
    <FormPage
      schema={formSchema}
      onSubmit={roleService.create}
    />
  )
}

