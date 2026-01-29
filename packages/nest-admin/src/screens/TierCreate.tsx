/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/tier-request-create-dto.schema'
import { tierService } from '../services/tier.service.ts'
import { FormPage } from '../components/FormPage'

export default function TierCreate() {
  return (
    <FormPage
      schema={formSchema}
      onSubmit={tierService.create}
    />
  )
}

