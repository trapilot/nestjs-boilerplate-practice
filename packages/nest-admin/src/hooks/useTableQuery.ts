import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

export type TableQuery = {
  page: number
  perPage: number
  search: string
}

export function useTableQuery(defaults: Partial<TableQuery> = {}) {
  const [params, setParams] = useSearchParams()

  const query: TableQuery = useMemo(() => {
    const page = Number(params.get('page') || defaults.page || 1)
    const perPage = Number(params.get('perPage') || defaults.perPage || 10)
    const search = String(params.get('search') || defaults.search || '')
    return { page, perPage, search }
  }, [params, defaults.page, defaults.perPage, defaults.search])

  const setQuery = (next: Partial<TableQuery>) => {
    const current = Object.fromEntries(params.entries())
    const updated: Record<string, string> = {
      ...current,
      ...(next.page !== undefined ? { page: String(next.page) } : {}),
      ...(next.perPage !== undefined ? { perPage: String(next.perPage) } : {}),
      ...(next.search !== undefined ? { search: next.search } : {}),
    }
    Object.keys(updated).forEach((k) => {
      if (updated[k] === '' || updated[k] === '0' || updated[k] === 'NaN') delete updated[k]
    })
    setParams(updated, { replace: true })
  }

  return { query, setQuery }
}
