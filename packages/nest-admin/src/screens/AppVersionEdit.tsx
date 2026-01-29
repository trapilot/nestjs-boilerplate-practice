/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/app-version-request-update-dto.schema'
import { appVersionService } from '../services/app-version.service.ts'
import { FormPage } from '../components/FormPage'
import { Navigate, useParams } from 'react-router-dom'

export default function AppVersionEdit() {
   const { id } = useParams<{ id: string }>()

  if (!id) {
     return <Navigate to="/404" replace />
  }

  return (
    <FormPage
      schema={formSchema}
      onLoad={() => appVersionService.get({ id })}
      onSubmit={(data) => appVersionService.update({ id }, data)}
    />
  )
}

