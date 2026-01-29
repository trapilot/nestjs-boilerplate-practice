/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/page-request-create-dto.schema'
import { pageService } from '../services/page.service.ts'
import { FormPage } from '../components/FormPage'

export default function PageCreate() {
  return (
    <FormPage
      schema={formSchema}
      onSubmit={pageService.create}
    />
  )
}

