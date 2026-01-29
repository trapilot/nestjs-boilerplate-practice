import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FormField, FormSchema } from '../types/form'
import { FilePreview } from './FilePreview'
import { MultiLangRichTextEditor } from './MultiLangRichTextEditor'

interface FormPageProps {
  schema: FormSchema
  onLoad?: () => Promise<any>
  onSubmit: (data: any) => Promise<any>
}

export function FormPage({ schema, onLoad, onSubmit }: FormPageProps) {
  const navigate = useNavigate()
  const [form, setForm] = React.useState<Record<string, any>>({})
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    if (!onLoad) return
    let ignore = false

    const run = async () => {
      try {
        setLoading(true)
        const data = await onLoad()
        if (!ignore) setForm(data)
      } catch (e: any) {
        if (!ignore) setError(e?.message || 'Failed to load data')
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    run()
    return () => {
      ignore = true
    }
  }, [onLoad])

  const setValue = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }
  const dateToHtmlValue = (value: any): string => {
    if (!value) return value

    const date = getValueDate(value)

    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')

    return `${yyyy}-${mm}-${dd}`
  }

  const getValueDate = (value: any) => {
    if (!value) return value

    // Already a Date
    if (value instanceof Date && !isNaN(value.getTime())) {
      return value
    }

    // ISO or timestamp (browser-safe)
    const iso = new Date(value)
    if (!isNaN(iso.getTime())) {
      return iso
    }

    // DD/MM/YYYY
    if (typeof value === 'string') {
      const parts = value.split(/[\/\-]/)
      if (parts.length === 3) {
        const [a, b, c] = parts.map(Number)

        // YYYY/MM/DD
        if (parts[0].length === 4) {
          return new Date(a, b - 1, c)
        }

        // DD/MM/YYYY or MM/DD/YYYY
        if (parts[2].length === 4) {
          const year = c

          // If the first digit is greater than 12, then it's definitely the DD/MM format.
          if (a > 12) {
            return new Date(year, b - 1, a)
          }

          // If the second number is greater than 12, then it's definitely MM/DD.
          if (b > 12) {
            return new Date(year, a - 1, b)
          }

          // Ambiguous (01/02/2026) → Select Convention
          // 👉 Here, DD/MM is preferred (can be changed).
          return new Date(year, b - 1, a)
        }
      }
    }

    return value
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {}

    Object.entries(schema.fields).forEach(([key, field]) => {
      if (field.required && !form[key]) {
        nextErrors[key] = 'This field is required'
      }
    })

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!validate()) {
        return
      }

      setLoading(true)
      await onSubmit(form)
      navigate(-1)
    } catch (e: any) {
      setError(e?.message || 'Submit failed')
    } finally {
      setLoading(false)
    }
  }

  const renderField = (key: string, field: FormField) => {
    const value = form[key] ?? ''
    const error = errors[key]
    const className = `input${error ? ' error' : ''}`

    console.log({key, field})
    switch (field.type) {
      case 'object':
        return (
          <MultiLangRichTextEditor
            field={key}
            format={field.format}
            value={value}
            onChange={(obj) => setValue(key, obj)}
            languages={field?.options ?? []}
          />
        )

      case 'boolean':
        return (
          <label className="checkbox">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => setValue(key, e.target.checked)}
            />
            { field.help && <span>{field.help}</span> }
          </label>
        )

      case 'number':
        return (
          <input
            type="number"
            className={className}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => setValue(key, Number(e.target.value))}
          />
        )

      default:
        switch (field.format) {
          case 'date':
            return (
              <input
                type="date"
                className={className}
                placeholder={field.placeholder}
                value={dateToHtmlValue(value)}
                onChange={(e) => setValue(key, e.target.value)}
              />
            )

            case 'date-time':
              return (
                <input
                  type="date"
                  className={className}
                  placeholder={field.placeholder}
                  value={dateToHtmlValue(value)}
                  onChange={(e) => setValue(key, e.target.value)}
                />
              )

            case 'enum':
              return (
                <select
                  className={className}
                  value={value ?? ''}
                  onChange={(e) => setValue(key, e.target.value || null)}
                >
                  {!field.required && <option value="">--</option>}
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )

          case 'text':
            return (
              <textarea
                className={className}
                rows={4}
                placeholder={field.placeholder}
                value={value}
                onChange={(e) => setValue(key, e.target.value)}
              />
            )

          case 'binary':
            return (
              <div className="file-field">
                <input
                  type="file"
                  className={className}
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null
                    setValue(key, file)
                  }}
                />

                {value && <FilePreview file={value} />}
              </div>
            )

          default:
            return (
              <input
                type={field.format}
                className={className}
                placeholder={field.placeholder}
                value={value}
                onChange={(e) => setValue(key, e.target.value)}
              />
            )
        }
    }
  }

  return (
    <div className="card">
      <div className="card-body">
        <form onSubmit={submit}>
          <h2>{schema.title}</h2>

          {error && (
            <div style={{ color: '#dc3545', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          {Object.entries(schema.fields).map(([key, field]) => (
            <div key={key} className="form-group">
              <label>
                {key}
                {field.required && ' *'}
              </label>
              {renderField(key, field)}
            </div>
          ))}

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
