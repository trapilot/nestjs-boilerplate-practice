/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/member-redemption-request-create-dto.schema'
import { memberRedemptionService } from '../services/member-redemption.service.ts'
import { FormPage } from '../components/FormPage'

export default function MemberRedemptionCreate() {
  return (
    <FormPage
      schema={formSchema}
      onSubmit={memberRedemptionService.create}
    />
  )
}

