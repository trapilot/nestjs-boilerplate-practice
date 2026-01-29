/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/member-request-update-dto.schema'
import { memberService } from '../services/member.service.ts'
import { FormPage } from '../components/FormPage'
import { Navigate, useParams } from 'react-router-dom'

export default function MemberEdit() {
   const { id } = useParams<{ id: string }>()

  if (!id) {
     return <Navigate to="/404" replace />
  }

  return (
    <FormPage
      schema={formSchema}
      onLoad={() => memberService.get({ id })}
      onSubmit={(data) => memberService.update({ id }, data)}
    />
  )
}

