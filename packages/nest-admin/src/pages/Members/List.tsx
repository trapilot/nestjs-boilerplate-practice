import { GenericList } from '../../components/Table/GenericList'
import { memberService } from '../../services/member.service'

export default function MembersList() {
  const columns = [
    'id',
    'tierId',
    'code',
    'type',
    'email',
    'name',
    'phone',
    'locale',
    'referralCode',
    'birthDate',
    'expiryDate',
    'pointBalance',
    'personalSpending',
    'referralSpending',
    'isActive',
    'createdAt',
    'updatedAt',
  ]
  return (
    <GenericList
      module="member"
      columns={columns}
      fetcher={(options) => memberService.list(options)}
    />
  )
}
