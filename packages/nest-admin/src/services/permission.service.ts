/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { _privateAxios, _publicAxios } from '../lib/httpClient'
import type { components as _components } from '../types/api'

type RequestOptions = { query?: Record<string, unknown>; config?: any }

export const permissionService = {
  list: async <T = _components['schemas']['PermissionResponseListDto'][]>(options?: RequestOptions): Promise<T> => {
    const query = options?.query || {}
const search = new URLSearchParams()
Object.entries(query).forEach(([k, v]) => {
  if (v === undefined || v === null) return
  if (Array.isArray(v)) v.forEach((vv) => search.append(k, String(vv)))
  else search.append(k, String(v))
})
const qs = search.toString()
    const baseUrl = "/permissions"
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = _privateAxios
    const config = options?.config || {}
    const data = await client.get(url, config)
    return data as T
  },
  create: async <T = _components['schemas']['PermissionResponseDetailDto']>(body?: _components['schemas']['PermissionRequestCreateDto'], options?: RequestOptions): Promise<T> => {
    const query = options?.query || {}
const search = new URLSearchParams()
Object.entries(query).forEach(([k, v]) => {
  if (v === undefined || v === null) return
  if (Array.isArray(v)) v.forEach((vv) => search.append(k, String(vv)))
  else search.append(k, String(v))
})
const qs = search.toString()
    const baseUrl = "/permissions"
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = _privateAxios
    const config = options?.config || {}
    const data = await client.post(url, body, config)
    return data as T
  },
  get: async <T = _components['schemas']['PermissionResponseDetailDto']>(params: { id: string | number }, options?: RequestOptions): Promise<T> => {
    const query = options?.query || {}
const search = new URLSearchParams()
Object.entries(query).forEach(([k, v]) => {
  if (v === undefined || v === null) return
  if (Array.isArray(v)) v.forEach((vv) => search.append(k, String(vv)))
  else search.append(k, String(v))
})
const qs = search.toString()
    const baseUrl = "/permissions/" + String(params.id)
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = _privateAxios
    const config = options?.config || {}
    const data = await client.get(url, config)
    return data as T
  },
  update: async <T = _components['schemas']['PermissionResponseDetailDto']>(params: { id: string | number }, body?: _components['schemas']['PermissionRequestUpdateDto'], options?: RequestOptions): Promise<T> => {
    const query = options?.query || {}
const search = new URLSearchParams()
Object.entries(query).forEach(([k, v]) => {
  if (v === undefined || v === null) return
  if (Array.isArray(v)) v.forEach((vv) => search.append(k, String(vv)))
  else search.append(k, String(v))
})
const qs = search.toString()
    const baseUrl = "/permissions/" + String(params.id)
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = _privateAxios
    const config = options?.config || {}
    const data = await client.put(url, body, config)
    return data as T
  },
}
