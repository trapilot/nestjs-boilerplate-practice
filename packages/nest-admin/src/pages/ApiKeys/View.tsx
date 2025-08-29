import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { apiKeyService } from '../../services/api-key.service'
import { ApiError } from '../../lib/apiError'
import { BooleanIcon } from '../../components/Icons/BooleanIcon'
import type { components as ApiSchemasRoot } from '../../types/api'

type ApiSchemas = ApiSchemasRoot['schemas']

type DetailDto = ApiSchemas['ApiKeyResponseDetailDto']

export default function ApiKeysView() {
  const { id } = useParams()
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [data, setData] = React.useState<DetailDto | null>(null)

  React.useEffect(() => {
    let ignore = false
    const run = async () => {
      try {
        setLoading(true)
        const res = await apiKeyService.get({ id: id as string })
        if (!ignore) setData(res as DetailDto)
      } catch (err) {
        const e = ApiError.fromUnknown(err)
        if (!ignore) setError(e.message)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    if (id) run()
    return () => {
      ignore = true
    }
  }, [id])

  if (loading) return <div>Loading...</div>
  if (error) return <div style={{ color: 'red' }}>{error}</div>
  if (!data) return null

  return (
    <div className="card" style={{ maxWidth: 640 }}>
      <div className="card-body">
        <h2 style={{ marginTop: 0 }}>API Key Detail</h2>
        <div className="form-group">
          <label>ID</label>
          <div>{data.id}</div>
        </div>
        <div className="form-group">
          <label>Name</label>
          <div>{data.name}</div>
        </div>
        <div className="form-group">
          <label>Key</label>
          <div>{data.key}</div>
        </div>
        <div className="form-group">
          <label>Status</label>
          <div>
            <BooleanIcon value={!!data.isActive} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link className="btn btn-secondary" to="/api-keys">
            Back
          </Link>
          <Link className="btn btn-primary" to={`/api-keys/${data.id}/edit`}>
            Edit
          </Link>
        </div>
      </div>
    </div>
  )
}
