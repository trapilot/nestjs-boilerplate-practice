import { privateAxios } from '../lib/httpClient'
import type { components as ApiSchemasRoot } from '../types/api'
type ApiSchemas = ApiSchemasRoot['schemas']

type RequestOptions = { query?: Record<string, unknown>; config?: any }

export const mediaService = {
  list: async (options?: RequestOptions): Promise<any> => {
    const query = options?.query || {}
    const search = new URLSearchParams()
    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined || v === null) return
      if (Array.isArray(v)) v.forEach((vv) => search.append(k, String(vv)))
      else search.append(k, String(v))
    })
    const qs = search.toString()
    const baseUrl = '/media'
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = privateAxios
    const config = options?.config || {}
    const data = await client.get(url, config)
    return data as any
  },
  create: async (body?: unknown, options?: RequestOptions): Promise<any> => {
    const query = options?.query || {}
    const search = new URLSearchParams()
    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined || v === null) return
      if (Array.isArray(v)) v.forEach((vv) => search.append(k, String(vv)))
      else search.append(k, String(v))
    })
    const qs = search.toString()
    const baseUrl = '/media'
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = privateAxios
    const config = options?.config || {}
    const data = await client.post(url, body, config)
    return data as any
  },
  get: async (params: { id: string | number }, options?: RequestOptions): Promise<any> => {
    const query = options?.query || {}
    const search = new URLSearchParams()
    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined || v === null) return
      if (Array.isArray(v)) v.forEach((vv) => search.append(k, String(vv)))
      else search.append(k, String(v))
    })
    const qs = search.toString()
    const baseUrl = '/media/' + String(params.id)
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = privateAxios
    const config = options?.config || {}
    const data = await client.get(url, config)
    return data as any
  },
  update: async (
    params: { id: string | number },
    body?: ApiSchemas['MediaRequestUpdateDto'],
    options?: RequestOptions,
  ): Promise<any> => {
    const query = options?.query || {}
    const search = new URLSearchParams()
    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined || v === null) return
      if (Array.isArray(v)) v.forEach((vv) => search.append(k, String(vv)))
      else search.append(k, String(v))
    })
    const qs = search.toString()
    const baseUrl = '/media/' + String(params.id)
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = privateAxios
    const config = options?.config || {}
    const data = await client.put(url, body, config)
    return data as any
  },
  delete: async (params: { id: string | number }, options?: RequestOptions): Promise<any> => {
    const query = options?.query || {}
    const search = new URLSearchParams()
    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined || v === null) return
      if (Array.isArray(v)) v.forEach((vv) => search.append(k, String(vv)))
      else search.append(k, String(v))
    })
    const qs = search.toString()
    const baseUrl = '/media/' + String(params.id)
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = privateAxios
    const config = options?.config || {}
    const data = await client.delete(url, config)
    return data as any
  },
}
