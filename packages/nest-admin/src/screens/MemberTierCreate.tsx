/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/member-tier-request-create-dto.schema'
import { memberTierService } from '../services/member-tier.service.ts'
import { FormPage } from '../components/FormPage'

export default function MemberTierCreate() {
  return (
    <FormPage
      schema={formSchema}
      onSubmit={memberTierService.create}
    />
  )
}

