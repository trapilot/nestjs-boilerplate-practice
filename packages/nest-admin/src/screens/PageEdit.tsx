/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/page-request-update-dto.schema'
import { pageService } from '../services/page.service.ts'
import { FormPage } from '../components/FormPage'
import { Navigate, useParams } from 'react-router-dom'

export default function PageEdit() {
   const { id } = useParams<{ id: string }>()

  if (!id) {
     return <Navigate to="/404" replace />
  }

  return (
    <FormPage
      schema={formSchema}
      onLoad={() => pageService.get({ id })}
      onSubmit={(data) => pageService.update({ id }, data)}
    />
  )
}

