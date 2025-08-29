import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiKeyService } from '../../services/api-key.service'
import { ApiError } from '../../lib/apiError'
import toast from 'react-hot-toast'
import type { components as ApiSchemasRoot } from '../../types/api'

type ApiSchemas = ApiSchemasRoot['schemas']

type UpdateDto = ApiSchemas['ApiKeyRequestUpdateDto']

type ApiKeyEntity = ApiSchemas['ApiKeyResponseDetailDto']

export default function ApiKeysEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState<UpdateDto>({ name: '' })
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let ignore = false
    const run = async () => {
      try {
        setLoading(true)
        const typedId: { id: string | number } = { id: id as string }
        const data: ApiKeyEntity = await apiKeyService.get(typedId)
        if (!ignore) setForm({ name: data?.name ?? '' })
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      const typedId: { id: string | number } = { id: id as string }
      const payload: UpdateDto = { name: form.name } as UpdateDto
      await apiKeyService.update(typedId, payload)
      toast.success('Saved successfully')
      navigate('/api-keys')
    } catch (err) {
      ApiError.fromUnknown(err).showError()
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div style={{ color: 'red' }}>{error}</div>

  return (
    <div className="card">
      <div className="card-body">
        <h2 style={{ marginTop: 0 }}>Edit API Key</h2>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              className="input"
              value={(form as any).name || ''}
              onChange={(e) => setForm((s) => ({ ...(s as any), name: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={!!(form as any).active}
                onChange={(e) => setForm((s) => ({ ...(s as any), active: e.target.checked }))}
              />
              Active
            </label>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
