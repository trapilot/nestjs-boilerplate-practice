import { GenericList } from '../../components/Table/GenericList'
import { apiVersionService } from '../../services/api-version.service'

export default function AppVersionsList() {
  return <GenericList module="app_version" fetcher={(options) => apiVersionService.list(options)} />
}
