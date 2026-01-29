/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/member-point-request-update-dto.schema'
import { memberPointService } from '../services/member-point.service.ts'
import { FormPage } from '../components/FormPage'
import { Navigate, useParams } from 'react-router-dom'

export default function MemberPointEdit() {
   const { id } = useParams<{ id: string }>()

  if (!id) {
     return <Navigate to="/404" replace />
  }

  return (
    <FormPage
      schema={formSchema}
      onLoad={() => memberPointService.get({ id })}
      onSubmit={(data) => memberPointService.update({ id }, data)}
    />
  )
}

