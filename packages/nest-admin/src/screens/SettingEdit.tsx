/* AUTO-GENERATED FILE. DO NOT EDIT. */

import formSchema from '../schemas/setting-request-update-dto.schema'
import { settingService } from '../services/setting.service.ts'
import { FormPage } from '../components/FormPage'
import { Navigate, useParams } from 'react-router-dom'

export default function SettingEdit() {
   const { id } = useParams<{ id: string }>()

  if (!id) {
     return <Navigate to="/404" replace />
  }

  return (
    <FormPage
      schema={formSchema}
      onLoad={() => settingService.get({ id })}
      onSubmit={(data) => settingService.update({ id }, data)}
    />
  )
}

