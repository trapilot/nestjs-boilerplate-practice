/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { useNavigate } from 'react-router-dom'
import { GenericList } from '../components/GenericList'
import { mediaService } from '../services'

export default function MediaList() {
  const navigate = useNavigate()

  return (
    <GenericList
      module="media"
      subject="MEDIA"
      actions={{
        onList: mediaService.list,
        onRead: (row) => navigate(`/media/${row.id}/view`),
        onCreate: mediaService.create,
        onUpdate: (row) => navigate(`/media/${row.id}/edit`),
        onDelete: mediaService.delete,
      }}
    />
  )
}
