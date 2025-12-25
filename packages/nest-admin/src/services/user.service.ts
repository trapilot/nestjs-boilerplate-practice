import { _privateAxios } from '../lib/httpClient'
import type { components } from '../types/api'
// @ts-ignore
type schemas = components['schemas']

type RequestOptions = { query?: Record<string, unknown>; config?: any }

export const userService = {
  list: async <T = schemas['UserResponseListDto'][]>(options?: RequestOptions): Promise<T> => {
    const query = options?.query || {}
    const search = new URLSearchParams()
    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined || v === null) return
      if (Array.isArray(v)) v.forEach((vv) => search.append(k, String(vv)))
      else search.append(k, String(v))
    })
    const qs = search.toString()
    const baseUrl = '/users'
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = _privateAxios
    const config = options?.config || {}
    const data = await client.get(url, config)
    return data as T
  },
  create: async <T = schemas['UserResponseDetailDto']>(
    body?: unknown,
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
    const baseUrl = '/users'
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = _privateAxios
    const config = options?.config || {}
    const data = await client.post(url, body, config)
    return data as T
  },
  get: async <T = schemas['UserResponseDetailDto']>(
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
    const baseUrl = '/users/' + String(params.id)
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = _privateAxios
    const config = options?.config || {}
    const data = await client.get(url, config)
    return data as T
  },
  update: async <T = schemas['UserResponseDetailDto']>(
    params: { id: string | number },
    body?: schemas['UserRequestUpdateDto'],
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
    const baseUrl = '/users/' + String(params.id)
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = _privateAxios
    const config = options?.config || {}
    const data = await client.put(url, body, config)
    return data as T
  },
  getLoginHistories: async <T = schemas['UserResponseLoginHistoryDto'][]>(
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
    const baseUrl = '/users/' + String(params.id) + '/login-histories'
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = _privateAxios
    const config = options?.config || {}
    const data = await client.get(url, config)
    return data as T
  },
  changeAvatar: async <T = schemas['UserResponseDetailDto']>(
    params: { id: string | number },
    body?: unknown,
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
    const baseUrl = '/users/' + String(params.id) + '/change-avatar'
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = _privateAxios
    const config = options?.config || {}
    const data = await client.put(url, body, config)
    return data as T
  },
}
