import retry from 'retry'

class AbortError extends Error {
  readonly name = 'AbortError' as const
  readonly originalError: Error

  constructor(message: string | Error) {
    super()

    if (message instanceof Error) {
      this.originalError = message
      this.message = message.message
    } else {
      this.originalError = new Error(message)
      this.originalError.stack = this.stack
      this.message = message
    }
  }
}

export interface FailedAttemptError extends Error {
  readonly attemptNumber: number
  readonly retriesLeft: number
}

export interface RetryOptions {
  readonly onFailedAttempt?: (error: FailedAttemptError) => void | Promise<void>
  readonly shouldRetry?: (error: FailedAttemptError) => boolean | Promise<boolean>
  readonly signal?: AbortSignal
  readonly retries?: number
  readonly factor?: number
  readonly minTimeout?: number
  readonly maxTimeout?: number
  readonly randomize?: boolean
}

const decorateErrorWithCounts = (
  error: Error,
  attemptNumber: number,
  options: RetryOptions,
): FailedAttemptError => {
  const retriesLeft = (options.retries ?? 10) - (attemptNumber - 1)
  return Object.assign(error, { attemptNumber, retriesLeft })
}

const isNetworkError = (error: Error): boolean => {
  return (
    error.message.includes('fetch failed') ||
    error.message.includes('network') ||
    error.message.includes('failed to fetch') ||
    error.message.includes('socket') ||
    error.message.includes('ECONNRESET') ||
    error.message.includes('ETIMEDOUT')
  )
}

export async function pNestRetry<T>(
  input: (attemptNumber: number) => PromiseLike<T> | T,
  options: RetryOptions = {},
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const operation = retry.operation({
      retries: options.retries ?? 10,
      factor: options.factor ?? 2,
      minTimeout: options.minTimeout ?? 1000,
      maxTimeout: options.maxTimeout ?? Infinity,
      randomize: options.randomize ?? false,
    })

    const abortHandler = () => {
      operation.stop()
      reject(options.signal?.reason)
    }

    if (options.signal && !options.signal.aborted) {
      options.signal.addEventListener('abort', abortHandler, { once: true })
    }

    const cleanUp = () => {
      options.signal?.removeEventListener('abort', abortHandler)
      operation.stop()
    }

    operation.attempt(async (attemptNumber) => {
      try {
        const result = await input(attemptNumber)
        cleanUp()
        resolve(result)
      } catch (error) {
        try {
          if (!(error instanceof Error)) {
            throw new TypeError(`Non-error was thrown: "${error}". You should only throw errors.`)
          }

          if (error instanceof AbortError) {
            throw error.originalError
          }

          if (error instanceof TypeError && !isNetworkError(error)) {
            throw error
          }

          const decoratedError = decorateErrorWithCounts(error, attemptNumber, options)

          if (options.shouldRetry && !(await options.shouldRetry(decoratedError))) {
            operation.stop()
            reject(error)
          }

          await options.onFailedAttempt?.(decoratedError)

          if (!operation.retry(error)) {
            throw operation.mainError()
          }
        } catch (finalError) {
          if (finalError instanceof Error) {
            const decoratedFinalError = decorateErrorWithCounts(finalError, attemptNumber, options)
            cleanUp()
            reject(decoratedFinalError)
          } else {
            reject(finalError)
          }
        }
      }
    })
  })
}
