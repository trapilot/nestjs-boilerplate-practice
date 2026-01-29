/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/media-request-update-dto.schema'
import { mediaService } from '../services/media.service.ts'
import { FormPage } from '../components/FormPage'
import { Navigate, useParams } from 'react-router-dom'

export default function MediaEdit() {
   const { id } = useParams<{ id: string }>()

  if (!id) {
     return <Navigate to="/404" replace />
  }

  return (
    <FormPage
      schema={formSchema}
      onLoad={() => mediaService.get({ id })}
      onSubmit={(data) => mediaService.update({ id }, data)}
    />
  )
}

