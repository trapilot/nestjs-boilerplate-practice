import { GenericList } from '../../components/Table/GenericList'
import { pointHistoryService } from '../../services/point-history.service'

export default function MemberPointsList() {
  return (
    <GenericList
      module="member_point"
      fetcher={(options) => pointHistoryService.list(options)}
      columns={[
        'id',
        'tierId',
        'memberId',
        'refereeId',
        'invoiceId',
        'invoiceAmount',
        'type',
        'point',
        'pointBalance',
        'multipleRatio',
        'isFirst',
        'isBirth',
        'isPending',
        'isActive',
        'expiryDate',
        'releaseDate',
        'createdDate',
        'createdAt',
        'updatedAt',
        'createdBy',
        'updatedBy',
      ]}
    />
  )
}
