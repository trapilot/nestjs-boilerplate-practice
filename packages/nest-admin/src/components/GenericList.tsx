import { useTranslation } from 'react-i18next'
import { useCan } from '../hooks/useCan'
import i18n from '../i18n'
import { getLanguage } from '../utils/language'
import { getFullDate, getShortDate } from '../utils/time'
import { BooleanIcon } from './BooleanIcon'
import { DataTable } from './DataTable'

interface ListActions {
  onList: (opts?: any) => Promise<any>
  onCreate: () => void
  onRead: (row: any) => void
  onUpdate: (row: any) => void
  onDelete: (row: any) => void
}

// function _inferColumns<T>(items: T[]): string[] {
//   const first = items.find(Boolean)
//   if (!first) return []
//   return Object.keys(first)
// }

function i18nColumns(module: string): string[] {
  const fields = i18n.getResourceBundle(i18n.language, 'module')?.[module]?.fields || {}
  return Object.keys(fields)
}

function renderCss(value: any, key: string) {
  if (key.endsWith('At') || key.endsWith('Date')) return 'nowrap'
  if (key === 'email' || key === 'name' || key === 'title') return 'nowrap'
  if (key.includes('code') || key.includes('number')) return 'nowrap'
  if (typeof value === 'string' && value.split(' ').length >= 2) return 'nowrap'
  return ''
}
function renderCell(value: any, key: string, lang: string) {
  if (typeof value === 'boolean') return <BooleanIcon value={value} />
  if (key.endsWith('At')) return getFullDate(value)
  if (key.endsWith('Date')) return getShortDate(value)
  if (value && typeof value === 'object') {
    return value[lang] ?? JSON.stringify(value)
  }
  return String(value ?? '')
}

export function GenericList({
  module,
  subject,
  actions,
}: {
  module: string
  subject: string
  actions: ListActions
}) {
  const can = useCan()
  const lang = getLanguage()
  const { t } = useTranslation('module')

  const columns = i18nColumns(module)
  const canUpdate = can(subject, 'update')
  const canDelete = can(subject, 'delete')

  return (
    <DataTable
      fetcher={actions.onList}
      title={t(`${module}.title`)}
      renderTable={(items) => {

        return (
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c}>
                    {t(`${module}.fields.${c}`)}
                  </th>
                ))}
                {(canUpdate || canDelete) && (
                  <th className="col-actions" />
                )}
              </tr>
            </thead>
            <tbody>
              {items.map((row: any) => (
                <tr key={row.id}>
                  {columns.map((c) => (
                    <td className={renderCss(row[c], c)} key={c}>
                      {renderCell(row[c], c, lang)}
                    </td>
                  ))}
                  {(canUpdate || canDelete) && (
                    <td className="col-actions">
                      {canUpdate && (
                        <button
                          className="btn-action btn-edit"
                          onClick={() => actions.onUpdate?.(row)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                      )}
                      {canDelete && (
                        <button
                          className="btn-action btn-delete"
                          onClick={() => {
                            if (confirm('Confirm delete?')) {
                              actions.onDelete?.(row)
                            }
                          }}
                          title="Delete"
                        >
                          🗑
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )
      }}
    />
  )
}
