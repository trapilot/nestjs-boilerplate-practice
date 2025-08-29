import { GenericList } from '../../components/Table/GenericList'
import { tierHistoryService } from '../../services/tier-history.service'

export default function MemberTiersList() {
  return (
    <GenericList module="member_tier" fetcher={(options) => tierHistoryService.list(options)} />
  )
}
