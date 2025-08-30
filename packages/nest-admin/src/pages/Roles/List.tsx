import { GenericList } from '../../components/Table/GenericList'
import { roleService } from '../../services/role.service'

export default function RolesList() {
  return (
    <GenericList
      module="role"
      fetcher={(options) => roleService.list(options)}
      columns={[
        'id',
        'title',
        'description',
        'isActive',
        'createdAt',
        'updatedAt',
        'createdBy',
        'updatedBy',
      ]}
    />
  )
}
