import { GenericList } from '../../components/Table/GenericList'
import { factService } from '../../services/fact.service'

export default function FactsList() {
  return <GenericList module="fact" fetcher={(options) => factService.list(options)} />
}
