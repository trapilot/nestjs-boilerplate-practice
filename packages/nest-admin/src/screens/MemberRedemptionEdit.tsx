/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/member-redemption-request-update-dto.schema'
import { memberRedemptionService } from '../services/member-redemption.service.ts'
import { FormPage } from '../components/FormPage'
import { Navigate, useParams } from 'react-router-dom'

export default function MemberRedemptionEdit() {
   const { id } = useParams<{ id: string }>()

  if (!id) {
     return <Navigate to="/404" replace />
  }

  return (
    <FormPage
      schema={formSchema}
      onLoad={() => memberRedemptionService.get({ id })}
      onSubmit={(data) => memberRedemptionService.update({ id }, data)}
    />
  )
}

