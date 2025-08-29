import { privateAxios } from '../lib/httpClient'
import type { components } from '../types/api'
// @ts-ignore
type schemas = components['schemas']

type RequestOptions = { query?: Record<string, unknown>; config?: any }

export const apiKeyService = {
  list: async <T = any>(options?: RequestOptions): Promise<T> => {
    const query = options?.query || {}
    const search = new URLSearchParams()
    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined || v === null) return
      if (Array.isArray(v)) v.forEach((vv) => search.append(k, String(vv)))
      else search.append(k, String(v))
    })
    const qs = search.toString()
    const baseUrl = '/api-keys'
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = privateAxios
    const config = options?.config || {}
    const data = await client.get(url, config)
    return data as T
  },
  create: async <T = any>(
    body?: schemas['ApiKeyRequestCreateDto'],
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
    const baseUrl = '/api-keys'
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = privateAxios
    const config = options?.config || {}
    const data = await client.post(url, body, config)
    return data as T
  },
  mapShorted: async <T = any>(options?: RequestOptions): Promise<T> => {
    const query = options?.query || {}
    const search = new URLSearchParams()
    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined || v === null) return
      if (Array.isArray(v)) v.forEach((vv) => search.append(k, String(vv)))
      else search.append(k, String(v))
    })
    const qs = search.toString()
    const baseUrl = '/api-keys/map-shorted'
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = privateAxios
    const config = options?.config || {}
    const data = await client.get(url, config)
    return data as T
  },
  get: async <T = any>(params: { id: string | number }, options?: RequestOptions): Promise<T> => {
    const query = options?.query || {}
    const search = new URLSearchParams()
    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined || v === null) return
      if (Array.isArray(v)) v.forEach((vv) => search.append(k, String(vv)))
      else search.append(k, String(v))
    })
    const qs = search.toString()
    const baseUrl = '/api-keys/' + String(params.id)
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = privateAxios
    const config = options?.config || {}
    const data = await client.get(url, config)
    return data as T
  },
  update: async <T = any>(
    params: { id: string | number },
    body?: schemas['ApiKeyRequestUpdateDto'],
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
    const baseUrl = '/api-keys/' + String(params.id)
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = privateAxios
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
    const baseUrl = '/api-keys/' + String(params.id)
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = privateAxios
    const config = options?.config || {}
    const data = await client.delete(url, config)
    return data as T
  },
  reset: async <T = any>(
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
    const baseUrl = '/api-keys/' + String(params.id) + '/reset'
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = privateAxios
    const config = options?.config || {}
    const data = await client.patch(url, body, config)
    return data as T
  },
  renew: async <T = any>(
    params: { id: string | number },
    body?: schemas['ApiKeyRequestRenewDto'],
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
    const baseUrl = '/api-keys/' + String(params.id) + '/renew'
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = privateAxios
    const config = options?.config || {}
    const data = await client.patch(url, body, config)
    return data as T
  },
  inactive: async <T = any>(
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
    const baseUrl = '/api-keys/' + String(params.id) + '/inactive'
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = privateAxios
    const config = options?.config || {}
    const data = await client.put(url, body, config)
    return data as T
  },
  active: async <T = any>(
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
    const baseUrl = '/api-keys/' + String(params.id) + '/active'
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = privateAxios
    const config = options?.config || {}
    const data = await client.put(url, body, config)
    return data as T
  },
}
