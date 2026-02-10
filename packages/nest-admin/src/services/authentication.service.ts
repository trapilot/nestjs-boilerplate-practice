/* AUTO-GENERATED FILE. DO NOT EDIT. */

import { _privateAxios, _publicAxios } from '../lib/httpClient'
import type { components as _components } from '../types/api'

type RequestOptions = { query?: Record<string, unknown>; config?: any }

export const authenticationService = {
  signUp: async <T = _components['schemas']['UserProfileResponseDto']>(body?: _components['schemas']['UserRequestSignUpDto'], options?: RequestOptions): Promise<T> => {
    const query = options?.query || {}
const search = new URLSearchParams()
Object.entries(query).forEach(([k, v]) => {
  if (v === undefined || v === null) return
  if (Array.isArray(v)) v.forEach((vv) => search.append(k, String(vv)))
  else search.append(k, String(v))
})
const qs = search.toString()
    const baseUrl = "/auth/sign-up"
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = _publicAxios
    const config = options?.config || {}
    const data = await client.post(url, body, config)
    return data as T
  },
  loginWithCredential: async <T = _components['schemas']['AuthResponseLoginDto']>(body?: _components['schemas']['UserRequestSignInDto'], options?: RequestOptions): Promise<T> => {
    const query = options?.query || {}
const search = new URLSearchParams()
Object.entries(query).forEach(([k, v]) => {
  if (v === undefined || v === null) return
  if (Array.isArray(v)) v.forEach((vv) => search.append(k, String(vv)))
  else search.append(k, String(v))
})
const qs = search.toString()
    const baseUrl = "/auth/login"
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = _publicAxios
    const config = options?.config || {}
    const data = await client.post(url, body, config)
    return data as T
  },
  loginWithGoogle: async <T = _components['schemas']['AuthResponseTokenDto']>(body?: unknown, options?: RequestOptions): Promise<T> => {
    const query = options?.query || {}
const search = new URLSearchParams()
Object.entries(query).forEach(([k, v]) => {
  if (v === undefined || v === null) return
  if (Array.isArray(v)) v.forEach((vv) => search.append(k, String(vv)))
  else search.append(k, String(v))
})
const qs = search.toString()
    const baseUrl = "/auth/login/social/google"
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = _privateAxios
    const config = options?.config || {}
    const data = await client.post(url, body, config)
    return data as T
  },
  loginWithApple: async <T = _components['schemas']['AuthResponseTokenDto']>(body?: unknown, options?: RequestOptions): Promise<T> => {
    const query = options?.query || {}
const search = new URLSearchParams()
Object.entries(query).forEach(([k, v]) => {
  if (v === undefined || v === null) return
  if (Array.isArray(v)) v.forEach((vv) => search.append(k, String(vv)))
  else search.append(k, String(v))
})
const qs = search.toString()
    const baseUrl = "/auth/login/social/apple"
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = _privateAxios
    const config = options?.config || {}
    const data = await client.post(url, body, config)
    return data as T
  },
  me: async <T = _components['schemas']['UserProfileResponseDto']>(options?: RequestOptions): Promise<T> => {
    const query = options?.query || {}
const search = new URLSearchParams()
Object.entries(query).forEach(([k, v]) => {
  if (v === undefined || v === null) return
  if (Array.isArray(v)) v.forEach((vv) => search.append(k, String(vv)))
  else search.append(k, String(v))
})
const qs = search.toString()
    const baseUrl = "/auth/_me"
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = _privateAxios
    const config = options?.config || {}
    const data = await client.get(url, config)
    return data as T
  },
  route: async <T = _components['schemas']['UserProfileResponseDto']>(options?: RequestOptions): Promise<T> => {
    const query = options?.query || {}
const search = new URLSearchParams()
Object.entries(query).forEach(([k, v]) => {
  if (v === undefined || v === null) return
  if (Array.isArray(v)) v.forEach((vv) => search.append(k, String(vv)))
  else search.append(k, String(v))
})
const qs = search.toString()
    const baseUrl = "/auth/_route"
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = _publicAxios
    const config = options?.config || {}
    const data = await client.get(url, config)
    return data as T
  },
  editProfile: async <T = _components['schemas']['UserProfileResponseDto']>(body?: _components['schemas']['UserEditProfileRequestDto'], options?: RequestOptions): Promise<T> => {
    const query = options?.query || {}
const search = new URLSearchParams()
Object.entries(query).forEach(([k, v]) => {
  if (v === undefined || v === null) return
  if (Array.isArray(v)) v.forEach((vv) => search.append(k, String(vv)))
  else search.append(k, String(v))
})
const qs = search.toString()
    const baseUrl = "/auth/edit-profile"
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = _privateAxios
    const config = options?.config || {}
    const data = await client.put(url, body, config)
    return data as T
  },
  refresh: async <T = _components['schemas']['AuthResponseTokenDto']>(body?: unknown, options?: RequestOptions): Promise<T> => {
    const query = options?.query || {}
const search = new URLSearchParams()
Object.entries(query).forEach(([k, v]) => {
  if (v === undefined || v === null) return
  if (Array.isArray(v)) v.forEach((vv) => search.append(k, String(vv)))
  else search.append(k, String(v))
})
const qs = search.toString()
    const baseUrl = "/auth/refresh"
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = _privateAxios
    const config = options?.config || {}
    const data = await client.post(url, body, config)
    return data as T
  },
  changePassword: async <T = _components['schemas']['UserProfileResponseDto']>(body?: _components['schemas']['UserRequestChangePasswordDto'], options?: RequestOptions): Promise<T> => {
    const query = options?.query || {}
const search = new URLSearchParams()
Object.entries(query).forEach(([k, v]) => {
  if (v === undefined || v === null) return
  if (Array.isArray(v)) v.forEach((vv) => search.append(k, String(vv)))
  else search.append(k, String(v))
})
const qs = search.toString()
    const baseUrl = "/auth/change-password"
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = _privateAxios
    const config = options?.config || {}
    const data = await client.put(url, body, config)
    return data as T
  },
  changeAvatar: async <T = _components['schemas']['UserProfileResponseDto']>(body?: unknown, options?: RequestOptions): Promise<T> => {
    const query = options?.query || {}
const search = new URLSearchParams()
Object.entries(query).forEach(([k, v]) => {
  if (v === undefined || v === null) return
  if (Array.isArray(v)) v.forEach((vv) => search.append(k, String(vv)))
  else search.append(k, String(v))
})
const qs = search.toString()
    const baseUrl = "/auth/change-avatar"
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = _privateAxios
    const config = options?.config || {}
    const data = await client.put(url, body, config)
    return data as T
  },
  confirmPassword: async <T = any>(body?: _components['schemas']['UserVerifyPasswordRequestDto'], options?: RequestOptions): Promise<T> => {
    const query = options?.query || {}
const search = new URLSearchParams()
Object.entries(query).forEach(([k, v]) => {
  if (v === undefined || v === null) return
  if (Array.isArray(v)) v.forEach((vv) => search.append(k, String(vv)))
  else search.append(k, String(v))
})
const qs = search.toString()
    const baseUrl = "/auth/confirm-password"
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = _privateAxios
    const config = options?.config || {}
    const data = await client.post(url, body, config)
    return data as T
  },
  changeConfirmPassword: async <T = any>(body?: _components['schemas']['UserRequestChangeConfirmPasswordDto'], options?: RequestOptions): Promise<T> => {
    const query = options?.query || {}
const search = new URLSearchParams()
Object.entries(query).forEach(([k, v]) => {
  if (v === undefined || v === null) return
  if (Array.isArray(v)) v.forEach((vv) => search.append(k, String(vv)))
  else search.append(k, String(v))
})
const qs = search.toString()
    const baseUrl = "/auth/change-confirm-password"
    const url = qs ? baseUrl + '?' + qs : baseUrl
    const client = _privateAxios
    const config = options?.config || {}
    const data = await client.post(url, body, config)
    return data as T
  },
}
