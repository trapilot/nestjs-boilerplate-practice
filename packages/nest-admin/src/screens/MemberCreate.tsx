/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/member-request-create-dto.schema'
import { memberService } from '../services/member.service.ts'
import { FormPage } from '../components/FormPage'

export default function MemberCreate() {
  return (
    <FormPage
      schema={formSchema}
      onSubmit={memberService.create}
    />
  )
}

