import axios, { AxiosError, AxiosResponse } from 'axios'
import { ENV } from '../config/env'
import { getAccessToken, setAccessToken } from '../hooks/useAuthToken'
import i18n from '../i18n'
import { authenticationService } from '../services'
import { getTimezone, nowISO } from '../utils/time'
import { ApiError } from './apiError'
import { setLastMetadata } from './responseMetadata'

// --- API Response Type Definitions ---

interface IBaseMetadata {
  path: string
  language: string
  timezone: string
  version: string
  timestamp: number
}

interface IListMetadata extends IBaseMetadata {
  availableSearch?: string[]
  availableOrderBy?: string[]
}

interface IPaginateMetadata extends IListMetadata {
  pagination?: {
    page: number
    perPage: number
    totalPage: number
    totalRecord: number
  }
}

type TMetadata = IBaseMetadata | IListMetadata | IPaginateMetadata

interface ISuccessResponse<T> {
  success: true
  metadata: TMetadata
  result: T
}

interface IErrorResponse {
  success: false
  metadata: TMetadata
  error: {
    message: string
    code: string
    error: string
  }
}

type IResponseBody<T = any> = ISuccessResponse<T> | IErrorResponse

// --- Axios Instance Setup ---

// Common header injector
function attachCommonHeaders(config: any) {
  config.headers = config.headers || {}
  let language: string | null = i18n.language || 'en'
  try {
    const storedLang = localStorage.getItem('language')
    language = storedLang
  } catch {}

  config.headers['x-language'] = language
  config.headers['x-timestamp'] = nowISO()
  config.headers['x-timezone'] = getTimezone()
  config.headers['x-version'] = ENV.version
  return config
}

// Centralized response handler
function handleResponse(response: AxiosResponse<IResponseBody>) {
  const responseBody = response.data
  if (responseBody.success) {
    // Capture metadata globally for downstream usage (e.g., pagination)
    try {
      setLastMetadata(responseBody.metadata as any)
    } catch {}
    return responseBody.result
  } else {
    return Promise.reject(new ApiError({ ...responseBody.error, status: response.status }))
  }
}

const publicAxios = axios.create({
  baseURL: ENV.apiBaseURL,
  withCredentials: false,
})
publicAxios.interceptors.request.use(attachCommonHeaders)
publicAxios.interceptors.response.use(handleResponse, (error: AxiosError) => Promise.reject(error))

// --- Refresh Token Logic ---
let isRefreshing = false
let failedQueue: any[] = []
function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

const privateAxios = axios.create({
  baseURL: ENV.apiBaseURL,
  withCredentials: false,
})
privateAxios.interceptors.request.use((config) => {
  config = attachCommonHeaders(config)
  const token = getAccessToken()
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})
privateAxios.interceptors.response.use(
  handleResponse, // Use the same success handler for private requests
  async (error: AxiosError) => {
    const originalRequest = error.config

    // Handle 401 Unauthorized for token refresh
    if (error?.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            if (originalRequest && originalRequest.headers && token) {
              ;(originalRequest as any).headers['Authorization'] = 'Bearer ' + token
            }
            return privateAxios(originalRequest as any)
          })
          .catch((err) => Promise.reject(err))
      }

      ;(originalRequest as any)._retry = true
      isRefreshing = true

      try {
        const { accessToken } = await authenticationService.refresh()
        setAccessToken(accessToken)
        processQueue(null, accessToken)
        if (originalRequest && originalRequest.headers) {
          ;(originalRequest as any).headers['Authorization'] = 'Bearer ' + accessToken
        }
        return privateAxios(originalRequest as any)
      } catch (err) {
        processQueue(err, null)
        // Clear tokens and redirect to login on refresh failure
        setAccessToken('')
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    // For non-401 errors, just forward the normalized error
    return Promise.reject(error)
  },
)

export { publicAxios as _publicAxios, privateAxios as _privateAxios }
