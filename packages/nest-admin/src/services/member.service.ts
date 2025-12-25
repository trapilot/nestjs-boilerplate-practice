import { _privateAxios, _publicAxios } from '../lib/httpClient'
import type { components } from '../types/api'
// @ts-ignore
type schemas = components['schemas']

type RequestOptions = { query?: Record<string, unknown>; config?: any }

export const memberService = {
  list: async <T = schemas['MemberResponseListDto'][]>(options?: RequestOptions): Promise<T> => {
    const query = options?.query || {}
    const search = new URLSearchParams()
    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined || v === null) return
      if (Array.isArray(v)) v.forEach((vv) => search.append(k, String(vv)))
      else search.append(k, String(v))
    })
    const qs = search.toString()
    const baseUrl = '/members'
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = _privateAxios
    const config = options?.config || {}
    const data = await client.get(url, config)
    return data as T
  },
  create: async <T = schemas['MemberResponseDetailDto']>(
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
    const baseUrl = '/members'
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = _privateAxios
    const config = options?.config || {}
    const data = await client.post(url, body, config)
    return data as T
  },
  mapShorted: async <T = schemas['MemberResponseListDto'][]>(
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
    const baseUrl = '/members/map-shorted'
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = _privateAxios
    const config = options?.config || {}
    const data = await client.get(url, config)
    return data as T
  },
  get: async <T = schemas['MemberResponseDetailDto']>(
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
    const baseUrl = '/members/' + String(params.id)
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = _privateAxios
    const config = options?.config || {}
    const data = await client.get(url, config)
    return data as T
  },
  put: async <T = schemas['MemberResponseDetailDto']>(
    params: { id: string | number },
    body?: schemas['MemberRequestUpdateDto'],
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
    const baseUrl = '/members/' + String(params.id)
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = _privateAxios
    const config = options?.config || {}
    const data = await client.put(url, body, config)
    return data as T
  },
  inactive: async <T = schemas['MemberResponseDetailDto']>(
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
    const baseUrl = '/members/' + String(params.id) + '/inactive'
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = _privateAxios
    const config = options?.config || {}
    const data = await client.put(url, body, config)
    return data as T
  },
  active: async <T = schemas['MemberResponseDetailDto']>(
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
    const baseUrl = '/members/' + String(params.id) + '/active'
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = _privateAxios
    const config = options?.config || {}
    const data = await client.put(url, body, config)
    return data as T
  },
  update: async <T = schemas['MemberResponseDetailDto']>(
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
    const baseUrl = '/members/' + String(params.id) + '/change-avatar'
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = _privateAxios
    const config = options?.config || {}
    const data = await client.put(url, body, config)
    return data as T
  },
  addPoint: async <T = schemas['MemberResponseDetailDto']>(
    params: { id: string | number },
    body?: schemas['MemberAddPointRequestDto'],
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
    const baseUrl = '/members/' + String(params.id) + '/points'
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = _privateAxios
    const config = options?.config || {}
    const data = await client.post(url, body, config)
    return data as T
  },
}
