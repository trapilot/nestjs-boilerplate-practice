import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { EditIcon, EyeIcon, TrashIcon } from '../../components/Icons'
import { BooleanIcon } from '../../components/Icons/BooleanIcon'
import { ListPage } from '../../components/Table/ListPage'
import { ApiError } from '../../lib/apiError'
import { apiKeyService } from '../../services/api-key.service'
import type { components as ApiSchemasRoot } from '../../types/api'

type ApiSchemas = ApiSchemasRoot['schemas']

type ListDto = ApiSchemas['ApiKeyResponseListDto']

type Item = ApiSchemas['ApiKeyResponseListDto']

export default function ApiKeysList() {
  const navigate = useNavigate()

  const handleDelete = async (id: number | string) => {
    const ok = window.confirm('Are you sure you want to delete this API Key?')
    if (!ok) return
    try {
      await apiKeyService.delete({ id })
      toast.success('Deleted successfully')
      navigate(0)
    } catch (err) {
      ApiError.fromUnknown(err).showError()
    }
  }

  return (
    <ListPage<ListDto>
      title="API Keys"
      fetcher={(options) => apiKeyService.list(options)}
      renderTable={(data) => (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Key</th>
              <th>Status</th>
              <th style={{ width: 140, whiteSpace: 'nowrap' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(Array.isArray((data as any)?.items) ? (data as any).items : (data as any))?.map(
              (item: Item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.key}</td>
                  <td>
                    <BooleanIcon value={!!item.isActive} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <Link className="btn-icon" to={`/api-keys/${item.id}`} title="View">
                        <EyeIcon />
                      </Link>
                      <Link className="btn-icon" to={`/api-keys/${item.id}/edit`} title="Edit">
                        <EditIcon />
                      </Link>
                      <button
                        className="btn-icon"
                        onClick={() => handleDelete(item.id)}
                        title="Delete"
                        aria-label="Delete"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      )}
    />
  )
}
