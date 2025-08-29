import { GenericList } from '../../components/Table/GenericList'
import { userService } from '../../services/user.service'

export default function UsersList() {
  return <GenericList module="user" fetcher={(options) => userService.list(options)} />
}
