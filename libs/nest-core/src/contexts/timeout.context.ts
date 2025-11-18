export class TimeoutError extends Error {
  readonly name = 'TimeoutError' as const

  constructor(message?: string) {
    super(message)
  }
}

interface ClearablePromise<T> extends Promise<T> {
  clear: () => void
}

export type TimeoutOptions<ReturnType> = {
  milliseconds: number
  fallback?: () => ReturnType | Promise<ReturnType>
  message?: string | Error | false
  customTimers?: {
    setTimeout: typeof global.setTimeout
    clearTimeout: typeof global.clearTimeout
  }
  signal?: AbortSignal
}

export function TimeoutContext<ValueType, ReturnType = ValueType>(
  promise: PromiseLike<ValueType>,
  options: TimeoutOptions<ReturnType>,
): ClearablePromise<ValueType | ReturnType> {
  const { milliseconds, fallback, message, customTimers = { setTimeout, clearTimeout } } = options

  let timer: NodeJS.Timeout

  const cancelablePromise = new Promise<ValueType | ReturnType>((resolve, reject) => {
    if (typeof milliseconds !== 'number' || Math.sign(milliseconds) !== 1) {
      throw new TypeError(
        `Expected \`milliseconds\` to be a positive number, got \`${milliseconds}\``,
      )
    }

    if (options.signal) {
      const { signal } = options
      if (signal.aborted) {
        reject(new TimeoutError('Operation aborted.'))
      }

      signal.addEventListener('abort', () => {
        reject(new TimeoutError('Operation aborted.'))
      })
    }

    if (milliseconds === Number.POSITIVE_INFINITY) {
      resolve(promise as Promise<ValueType>)
      return
    }

    timer = customTimers.setTimeout.call(
      undefined,
      () => {
        if (fallback) {
          try {
            resolve(fallback())
          } catch (error) {
            reject(error)
          }
          return
        }

        if (typeof (promise as any).cancel === 'function') {
          ;(promise as any).cancel()
        }

        if (message === false) {
          resolve(undefined as any)
        } else if (message instanceof Error) {
          reject(message)
        } else {
          reject(
            new TimeoutError(message ?? `Promise timed out after ${milliseconds} milliseconds`),
          )
        }
      },
      milliseconds,
    )
    ;(async () => {
      try {
        resolve(await promise)
      } catch (error) {
        reject(error)
      }
    })()
  }) as ClearablePromise<ValueType | ReturnType>

  cancelablePromise.clear = () => {
    customTimers.clearTimeout.call(undefined, timer)
    timer = undefined
  }

  return cancelablePromise
}
