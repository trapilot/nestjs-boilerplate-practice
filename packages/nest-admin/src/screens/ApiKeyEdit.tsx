/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/api-key-request-update-dto.schema'
import { apiKeyService } from '../services/api-key.service.ts'
import { FormPage } from '../components/FormPage'
import { Navigate, useParams } from 'react-router-dom'

export default function ApiKeyEdit() {
   const { id } = useParams<{ id: string }>()

  if (!id) {
     return <Navigate to="/404" replace />
  }

  return (
    <FormPage
      schema={formSchema}
      onLoad={() => apiKeyService.get({ id })}
      onSubmit={(data) => apiKeyService.update({ id }, data)}
    />
  )
}

