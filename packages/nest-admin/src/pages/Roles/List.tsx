import { GenericList } from '../../components/Table/GenericList'
import { roleService } from '../../services/role.service'

export default function RolesList() {
  return <GenericList module="role" fetcher={(options) => roleService.list(options)} />
}
