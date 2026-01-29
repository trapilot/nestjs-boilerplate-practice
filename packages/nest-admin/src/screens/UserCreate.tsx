/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/user-request-create-dto.schema'
import { userService } from '../services/user.service.ts'
import { FormPage } from '../components/FormPage'

export default function UserCreate() {
  return (
    <FormPage
      schema={formSchema}
      onSubmit={userService.create}
    />
  )
}

