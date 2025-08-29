import { privateAxios } from '../lib/httpClient'
import type { components } from '../types/api'
// @ts-ignore
type schemas = components['schemas']

type RequestOptions = { query?: Record<string, unknown>; config?: any }

export const dashboardService = {
  get: async <T = schemas['DashboardSummaryResponseDto']>(options?: RequestOptions): Promise<T> => {
    const query = options?.query || {}
    const search = new URLSearchParams()
    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined || v === null) return
      if (Array.isArray(v)) v.forEach((vv) => search.append(k, String(vv)))
      else search.append(k, String(v))
    })
    const qs = search.toString()
    const baseUrl = '/dashboard/view-summary'
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = privateAxios
    const config = options?.config || {}
    const data = await client.get(url, config)
    return data as T
  },
  refresh: async <T = schemas['DashboardSummaryResponseDto']>(
    options?: RequestOptions,
  ): Promise<T> => {
    const query = options?.query || {}
    const search = new URLSearchParams()
    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined || v === null) return
      if (Array.isArray(v)) v.forEach((vv) => search.append(k, String(vv)))
      else search.append(k, String(v))
    })
    const qs = search.toString()
    const baseUrl = '/dashboard/refresh-summary'
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = privateAxios
    const config = options?.config || {}
    const data = await client.get(url, config)
    return data as T
  },
  viewDataList: async <T = schemas['DashboardSummaryResponseDto']>(
    options?: RequestOptions,
  ): Promise<T> => {
    const query = options?.query || {}
    const search = new URLSearchParams()
    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined || v === null) return
      if (Array.isArray(v)) v.forEach((vv) => search.append(k, String(vv)))
      else search.append(k, String(v))
    })
    const qs = search.toString()
    const baseUrl = '/dashboard/view-data-list'
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = privateAxios
    const config = options?.config || {}
    const data = await client.get(url, config)
    return data as T
  },
}
