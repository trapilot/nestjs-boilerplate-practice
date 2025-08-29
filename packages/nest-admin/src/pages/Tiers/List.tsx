import { GenericList } from '../../components/Table/GenericList'
import { tierService } from '../../services/tier.service'

export default function TiersList() {
  return <GenericList module="tier" fetcher={(options) => tierService.list(options)} />
}
