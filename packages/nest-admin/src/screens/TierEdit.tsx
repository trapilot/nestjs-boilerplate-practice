/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/tier-request-update-dto.schema'
import { tierService } from '../services/tier.service.ts'
import { FormPage } from '../components/FormPage'
import { Navigate, useParams } from 'react-router-dom'

export default function TierEdit() {
   const { id } = useParams<{ id: string }>()

  if (!id) {
     return <Navigate to="/404" replace />
  }

  return (
    <FormPage
      schema={formSchema}
      onLoad={() => tierService.get({ id })}
      onSubmit={(data) => tierService.update({ id }, data)}
    />
  )
}

