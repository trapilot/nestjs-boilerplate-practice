import { _privateAxios, _publicAxios } from '../lib/httpClient'
import type { components } from '../types/api'
// @ts-ignore
type schemas = components['schemas']

type RequestOptions = { query?: Record<string, unknown>; config?: any }

export const pointHistoryService = {
  list: async <T = schemas['PointHistoryResponseListDto'][]>(
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
    const baseUrl = '/point-histories'
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = _privateAxios
    const config = options?.config || {}
    const data = await client.get(url, config)
    return data as T
  },
  create: async <T = schemas['PointHistoryResponseDetailDto']>(
    body?: schemas['PointHistoryRequestCreateDto'],
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
    const baseUrl = '/point-histories'
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = _privateAxios
    const config = options?.config || {}
    const data = await client.post(url, body, config)
    return data as T
  },
  mapShorted: async <T = schemas['PointHistoryResponseListDto'][]>(
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
    const baseUrl = '/point-histories/map-shorted'
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = _privateAxios
    const config = options?.config || {}
    const data = await client.get(url, config)
    return data as T
  },
  get: async <T = schemas['PointHistoryResponseDetailDto']>(
    params: { id: string | number },
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
    const baseUrl = '/point-histories/' + String(params.id)
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = _privateAxios
    const config = options?.config || {}
    const data = await client.get(url, config)
    return data as T
  },
  update: async <T = schemas['PointHistoryResponseDetailDto']>(
    params: { id: string | number },
    body?: schemas['PointHistoryRequestUpdateDto'],
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
    const baseUrl = '/point-histories/' + String(params.id)
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = _privateAxios
    const config = options?.config || {}
    const data = await client.put(url, body, config)
    return data as T
  },
  delete: async <T = any>(
    params: { id: string | number },
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
    const baseUrl = '/point-histories/' + String(params.id)
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = _privateAxios
    const config = options?.config || {}
    const data = await client.delete(url, config)
    return data as T
  },
}
