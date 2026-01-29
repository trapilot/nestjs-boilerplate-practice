/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/member-tier-request-update-dto.schema'
import { memberTierService } from '../services/member-tier.service.ts'
import { FormPage } from '../components/FormPage'
import { Navigate, useParams } from 'react-router-dom'

export default function MemberTierEdit() {
   const { id } = useParams<{ id: string }>()

  if (!id) {
     return <Navigate to="/404" replace />
  }

  return (
    <FormPage
      schema={formSchema}
      onLoad={() => memberTierService.get({ id })}
      onSubmit={(data) => memberTierService.update({ id }, data)}
    />
  )
}

