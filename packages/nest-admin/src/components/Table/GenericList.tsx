import { useTranslation } from 'react-i18next'
import { getLanguage } from '../../utils/language'
import { getFullDate, getShortDate } from '../../utils/time'
import { BooleanIcon } from '../Icons/BooleanIcon'
import { ListPage } from './ListPage'

function inferColumns(items: any[]): string[] {
  const first = items.find((x) => x && typeof x === 'object') || {}
  return Object.keys(first)
}

function renderObject(value: any, key: string, language: string) {
  if (value === null || value === undefined) return ''
  if (key === 'createdBy' || key === 'updatedBy' || key === 'deletedBy') {
    return <span className="nowrap">{value['name'] || ''}</span>
  }
  if (language in value) return value[language] || ''
  return <pre>{JSON.stringify(value, null, 2)}</pre>
}

function renderShortDate(value: any) {
  if (value === null || value === undefined) return ''
  return <span className="nowrap">{getShortDate(value)}</span>
}

function renderFullDate(value: any) {
  if (value === null || value === undefined) return ''
  return <span className="nowrap">{getFullDate(value)}</span>
}

function renderCell(value: any, key: string, language: string) {
  const t = typeof value
  if (t === 'boolean') return <BooleanIcon value={value} />
  if (t === 'object') return renderObject(value, key, language)
  if (key.endsWith('At')) return renderFullDate(value)
  if (key.endsWith('Date')) return renderShortDate(value)
  if (value === null || value === undefined) return ''
  return String(value)
}

export function GenericList({
  module,
  fetcher,
  columns,
}: {
  module: string
  fetcher: (options?: { query?: Record<string, unknown> }) => Promise<any>
  columns?: string[]
}) {
  const language = getLanguage()
  const { t } = useTranslation(`module`)

  return (
    <ListPage<any>
      title={t(`${module}.title`)}
      fetcher={fetcher}
      renderTable={(data: any) => {
        const items: any[] = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
            ? data
            : []
        const cols = columns && columns.length > 0 ? columns : inferColumns(items)
        return (
          <table className="table">
            <thead>
              <tr>
                {cols.map((c) => (
                  <th key={c}>{t(`${module}.fields.${c}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((row, idx) => (
                <tr key={row?.id ?? idx}>
                  {cols.map((c) => (
                    <td key={c}>{renderCell((row as any)[c], c, language)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )
      }}
    />
  )
}
