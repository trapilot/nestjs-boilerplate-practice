import React from 'react'
import { Pagination } from './Pagination'
import { useTableQuery } from '../hooks/useTableQuery'
import { getLastMetadata } from '../lib/responseMetadata'

export interface DataTableProps<T> {
  title: string
  limit?: number
  fetcher: (options?: { query?: Record<string, unknown> }) => Promise<T>
  renderTable: (data: T) => React.ReactNode
  actions?: React.ReactNode // 👈 NEW
}

export function DataTable<T>({
  title,
  fetcher,
  renderTable,
  limit,
  actions,
}: DataTableProps<T>) {
  const perPageOptions = [10, 20, 50, 100]

  const { query, setQuery } = useTableQuery({
    page: 1,
    perPage: limit || perPageOptions[0],
  })

  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let ignore = false

    const run = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetcher({
          query: {
            page: query.page,
            perPage: query.perPage,
            search: query.search,
          },
        })
        if (!ignore) setData(res)
      } catch (e: any) {
        if (!ignore) setError(e?.message || 'Failed to fetch data')
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    run()
    return () => {
      ignore = true
    }
  }, [query.page, query.perPage, query.search])

  const meta = getLastMetadata()

  const availableSearch = meta?.availableSearch ?? []
  const totalPage = meta?.pagination?.totalPage ?? 1
  const perPage =  meta?.pagination?.perPage ?? query.perPage
  const showPagination = totalPage > 1 || perPage !== perPageOptions[0]

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const value = String(fd.get('search') || '')
    setQuery({ search: value, page: 1 })
  }

  return (
    <div>
      <div className="table-toolbar">
        <h2 className="table-title">{title}</h2>

        <div className="table-toolbar-actions">
          {availableSearch.length > 0 && (
            <form onSubmit={onSearch} className="table-search">
              <input
                name="search"
                defaultValue={query.search}
                placeholder="Search..."
              />
              <button type="submit">Search</button>
            </form>
          )}

          {actions}
        </div>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {!loading && data && (
        <>
          <div className="table-container">
            {renderTable(data)}
          </div>

          {showPagination && (
            <div className="table-pagination">
              <Pagination
                page={query.page}
                totalPage={totalPage}
                onChange={(p) => setQuery({ page: p })}
                maxButtons={7}
              />

              <select
                value={query.perPage}
                onChange={(e) =>
                  setQuery({
                    perPage: Number(e.target.value),
                    page: 1,
                  })
                }
              >
                {perPageOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          )}
        </>
      )}
    </div>
  )
}
