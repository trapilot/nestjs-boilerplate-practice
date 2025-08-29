import { GenericList } from '../../components/Table/GenericList'
import { pointHistoryService } from '../../services/point-history.service'

export default function MemberPointsList() {
  return (
    <GenericList module="member_point" fetcher={(options) => pointHistoryService.list(options)} />
  )
}
