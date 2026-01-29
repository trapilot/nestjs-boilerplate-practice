/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/api-key-request-create-dto.schema'
import { apiKeyService } from '../services/api-key.service.ts'
import { FormPage } from '../components/FormPage'

export default function ApiKeyCreate() {
  return (
    <FormPage
      schema={formSchema}
      onSubmit={apiKeyService.create}
    />
  )
}

