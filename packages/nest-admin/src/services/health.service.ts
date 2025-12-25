import { _privateAxios, _publicAxios } from '../lib/httpClient'
import type { components } from '../types/api'
// @ts-ignore
type schemas = components['schemas']

type RequestOptions = { query?: Record<string, unknown>; config?: any }

export const healthService = {
  ready: async <T = any>(options?: RequestOptions): Promise<T> => {
    const query = options?.query || {}
    const search = new URLSearchParams()
    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined || v === null) return
      if (Array.isArray(v)) v.forEach((vv) => search.append(k, String(vv)))
      else search.append(k, String(v))
    })
    const qs = search.toString()
    const baseUrl = '/api/health/ready'
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = _publicAxios
    const config = options?.config || {}
    const data = await client.get(url, config)
    return data as T
  },
  live: async <T = any>(options?: RequestOptions): Promise<T> => {
    const query = options?.query || {}
    const search = new URLSearchParams()
    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined || v === null) return
      if (Array.isArray(v)) v.forEach((vv) => search.append(k, String(vv)))
      else search.append(k, String(v))
    })
    const qs = search.toString()
    const baseUrl = '/api/health/live'
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = _publicAxios
    const config = options?.config || {}
    const data = await client.get(url, config)
    return data as T
  },
}
