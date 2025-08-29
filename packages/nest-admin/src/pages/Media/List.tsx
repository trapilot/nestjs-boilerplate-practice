import { GenericList } from '../../components/Table/GenericList'
import { mediaService } from '../../services/media.service'

export default function MediaList() {
  return <GenericList module="media" fetcher={(options) => mediaService.list(options)} />
}
