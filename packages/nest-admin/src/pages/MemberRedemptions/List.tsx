import { GenericList } from '../../components/Table/GenericList'
import { productHistoryService } from '../../services/product-history.service'

export default function MemberRedemptionsList() {
  return (
    <GenericList
      module="member_redemption"
      fetcher={(options) => productHistoryService.list(options)}
    />
  )
}
