/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/member-point-request-create-dto.schema'
import { memberPointService } from '../services/member-point.service.ts'
import { FormPage } from '../components/FormPage'

export default function MemberPointCreate() {
  return (
    <FormPage
      schema={formSchema}
      onSubmit={memberPointService.create}
    />
  )
}

