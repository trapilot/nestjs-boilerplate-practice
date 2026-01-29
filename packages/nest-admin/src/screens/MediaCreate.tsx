/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/media-request-create-dto.schema'
import { mediaService } from '../services/media.service.ts'
import { FormPage } from '../components/FormPage'

export default function MediaCreate() {
  return (
    <FormPage
      schema={formSchema}
      onSubmit={mediaService.create}
    />
  )
}

