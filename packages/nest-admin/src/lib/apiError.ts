import toast from 'react-hot-toast'

type RecordString = Record<string, string>

export type ApiErrorPayload = {
  message?: string
  code?: string | number
  details?: RecordString | Array<{ property?: string; message?: string }>
  status?: number
}

/**
 * Unified API Error wrapper to normalize server/axios errors.
 */
export class ApiError extends Error {
  public code?: string | number
  public status?: number
  public fieldErrors: RecordString

  constructor(payload: ApiErrorPayload | string, fallbackStatus?: number) {
    const normalized = ApiError.normalize(payload, fallbackStatus)
    super(normalized.message || 'Unexpected error')
    this.name = 'ApiError'
    this.code = normalized.code
    this.status = normalized.status
    this.fieldErrors = normalized.fieldErrors
  }

  static fromUnknown(error: unknown): ApiError {
    // Axios error shape safe parsing
    const maybeAxios: any = error as any
    const status = maybeAxios?.response?.status
    const data = maybeAxios?.response?.data

    if (data) {
      // Try to detect common back-end error envelopes
      // Case 1: { success: false, error: { message, code, error, errors? } }
      if (data.success === false && data.error) {
        const e = data.error
        return new ApiError(
          {
            message: e.message || e.error,
            code: e.code,
            details: e.details,
            status,
          },
          status,
        )
      }
      // Case 2: { message, errors? }
      if (typeof data === 'object') {
        return new ApiError(
          {
            message: data.message || maybeAxios.message,
            code: (data as any).code,
            details: (data as any).details,
            status,
          },
          status,
        )
      }
    }

    // Fallbacks
    if (maybeAxios?.message) return new ApiError(maybeAxios.message, status)
    return new ApiError('Network error', status)
  }

  static normalize(payload: ApiErrorPayload | string, fallbackStatus?: number) {
    if (typeof payload === 'string') {
      return {
        message: payload,
        code: undefined as string | number | undefined,
        status: fallbackStatus,
        fieldErrors: {} as RecordString,
      }
    }

    const message = payload.message || 'Unexpected error'
    const code = payload.code
    const status = payload.status ?? fallbackStatus
    const fieldErrors: RecordString = {}

    // Normalize various error formats for field errors
    if (Array.isArray(payload.details)) {
      payload.details.forEach((e) => {
        if (!e) return
        const property = (e as any).property || (e as any).name
        const msg = (e as any).message || String(e)
        if (property) fieldErrors[property] = msg
      })
    } else if (payload.details && typeof payload.details === 'object') {
      Object.entries(payload.details).forEach(([k, v]) => {
        fieldErrors[k] = Array.isArray(v) ? String(v[0]) : String(v)
      })
    }

    return { message, code, status, fieldErrors }
  }

  showError() {
    const msg = this.message || 'Something went wrong'
    toast.error(msg)
  }

  getErrors(): RecordString {
    return this.fieldErrors || {}
  }
}
