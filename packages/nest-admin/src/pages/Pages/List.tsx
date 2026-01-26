import { GenericList } from '../../components/Table/GenericList'
import { pageService } from '../../services/page.service'

export default function PagesList() {
  return <GenericList module="page" fetcher={(options) => pageService.list(options)} />
}
