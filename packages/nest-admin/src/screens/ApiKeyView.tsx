/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { useNavigate } from 'react-router-dom'
import { GenericList } from '../components/GenericList'
import { apiKeyService } from '../services'

export default function ApiKeyView() {
  const navigate = useNavigate()

  return (
    <GenericList
      module="api-key"
      subject="API_KEY"
      actions={{
        onList: apiKeyService.list,
        onRead: (row) => navigate(`/api-key/${row.id}/view`),
        onCreate: apiKeyService.create,
        onUpdate: (row) => navigate(`/api-key/${row.id}/edit`),
        onDelete: apiKeyService.delete,
      }}
    />
  )
}
