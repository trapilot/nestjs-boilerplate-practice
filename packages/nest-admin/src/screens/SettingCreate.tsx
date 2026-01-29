/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/setting-request-create-dto.schema'
import { settingService } from '../services/setting.service.ts'
import { FormPage } from '../components/FormPage'

export default function SettingCreate() {
  return (
    <FormPage
      schema={formSchema}
      onSubmit={settingService.create}
    />
  )
}

