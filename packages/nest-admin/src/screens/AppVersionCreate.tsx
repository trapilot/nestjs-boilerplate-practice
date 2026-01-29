/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/app-version-request-create-dto.schema'
import { appVersionService } from '../services/app-version.service.ts'
import { FormPage } from '../components/FormPage'

export default function AppVersionCreate() {
  return (
    <FormPage
      schema={formSchema}
      onSubmit={appVersionService.create}
    />
  )
}

