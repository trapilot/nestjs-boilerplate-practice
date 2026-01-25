import OpossumCircuitBreaker, { Options } from 'opossum'

const events = new Map<string, Map<string, Map<string, string>>>()
const breakerInstances = new Map<string, OpossumCircuitBreaker>()

const ERROR_THRESHOLD_PERCENTAGE = 20 // The circuit opens when 20% of requests fail.
const VOLUME_THRESHOLD = 5 // It requires at least 5 requests to open the circuit.
const ROLLING_COUNT_TIMEOUT = 5000 // Counting the failures for 5 seconds
const RESET_TIMEOUT = 2500 // Circuit reset time (2.5 seconds)
const ALLOW_WARM_UP = true // Allows for faults without opening the circuit during warm-up.

export type CircuitBreakerInput = {
  /**
   * Static namespace
   * example: smtp | http | db | payment
   */
  circuitGroup?: string

  /**
   * Dynamic key resolver
   */
  resolveKey?: (args: unknown[], context: any) => string

  options?: Options
}

export type OnEventInput = {
  eventName: EventType
  circuitGroup?: string
}

export type OnHalfOpenInput = {
  resetTimeout: number
}

export type OnFireInput = {
  args: unknown[]
}

export type OnSuccessInput<T = any> = {
  input: T
  latencyMs: number
}

export type OnFallbackInput<T = any> = {
  input: T
  err: Error
}

export type OnFailureInput = {
  err: Error
  latencyMs: number
  args: unknown[]
}

type EventType =
  | 'halfOpen'
  | 'close'
  | 'open'
  | 'shutdown'
  | 'fire'
  | 'cacheHit'
  | 'cacheMiss'
  | 'reject'
  | 'timeout'
  | 'success'
  | 'semaphoreLocked'
  | 'healthCheckFailed'
  | 'fallback'
  | 'failure'

export function CircuitBreaker(input: CircuitBreakerInput = {}) {
  return function (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): void {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: unknown[]) {
      const group = input.circuitGroup ?? 'default'
      const circuitKey = input.resolveKey ? `${group}:${input.resolveKey(args, this)}` : group

      const opts: Options = {
        errorThresholdPercentage:
          input.options?.errorThresholdPercentage ?? ERROR_THRESHOLD_PERCENTAGE,
        volumeThreshold: input.options?.volumeThreshold ?? VOLUME_THRESHOLD,
        rollingCountTimeout: input.options?.rollingCountTimeout ?? ROLLING_COUNT_TIMEOUT,
        resetTimeout: input.options?.resetTimeout ?? RESET_TIMEOUT,
        allowWarmUp: input.options?.allowWarmUp ?? ALLOW_WARM_UP,
        timeout: input.options?.timeout,
        group: circuitKey,
      }

      const className = target.constructor.name
      const instanceKey = `${className}:${String(propertyKey)}:${opts.group}`

      if (!breakerInstances.has(instanceKey)) {
        const breaker = new OpossumCircuitBreaker(originalMethod.bind(this), opts)
        breakerInstances.set(instanceKey, breaker)

        // bind events
        const classEvents = events.get(className) || new Map()
        const circuitEvents = classEvents.get(opts.group) || new Map()

        for (const [eventName, methodName] of circuitEvents) {
          if (eventName !== 'fallback' && typeof (this as any)[`${methodName}`] === 'function') {
            breaker.on(eventName as any, (this as any)[`${methodName}`].bind(this))
          }
        }

        const fallbackMethod = circuitEvents.get('fallback')
        if (fallbackMethod && typeof (this as any)[`${fallbackMethod}`] === 'function') {
          breaker.fallback(async (args: unknown, error: Error) => {
            return await (this as any)[`${fallbackMethod}`]({ input: args, err: error })
          })
        }
      }

      try {
        return await breakerInstances.get(instanceKey)!.fire(...args)
      } catch (error) {
        throw error
      }
    }
  }
}

/**
 * Decorator for recording events in the circuit.
 * Events are stored and used by `CircuitBreaker` when it is instantiated.
 */
export function CircuitCatch({ eventName, circuitGroup = 'default' }: OnEventInput) {
  return function (target: object, propertyKey: string | symbol): void {
    const className = target.constructor.name

    if (!events.has(className)) {
      events.set(className, new Map())
    }

    const classEvents = events.get(className)!
    if (!classEvents.has(circuitGroup)) {
      classEvents.set(circuitGroup, new Map())
    }

    const circuitEvents = classEvents.get(circuitGroup)!
    circuitEvents.set(eventName, propertyKey.toString())
  }
}
