import OpossumCircuitBreaker, { Options } from 'opossum'

const events = new Map<string, Map<string, Map<string, string>>>()
const breakerInstances = new Map<string, OpossumCircuitBreaker>()

const ERROR_THRESHOLD_PERCENTAGE = 20 // O circuito abre quando 20% das requisições falham
const VOLUME_THRESHOLD = 5 // Exige pelo menos 5 requisições para abrir o circuito
const ROLLING_COUNT_TIMEOUT = 5000 // Contagem das falhas durante 5 segundos
const RESET_TIMEOUT = 2500 // Tempo de reset do circuito (2.5 segundos)
const ALLOW_WARM_UP = true // Permite falhas sem abrir o circuito durante o aquecimento

export type CircuitBreakerInput = {
  options?: Options
  circuitGroup?: string
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

export function CircuitBreaker(
  input: CircuitBreakerInput = { options: {}, circuitGroup: 'default' },
) {
  return function (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): void {
    const opts = input?.options ?? {}
    const opt: Options = {
      ...opts,
      errorThresholdPercentage: opts?.errorThresholdPercentage ?? ERROR_THRESHOLD_PERCENTAGE,
      volumeThreshold: opts?.volumeThreshold ?? VOLUME_THRESHOLD,
      rollingCountTimeout: opts?.rollingCountTimeout ?? ROLLING_COUNT_TIMEOUT,
      resetTimeout: opts?.resetTimeout ?? RESET_TIMEOUT,
      allowWarmUp: opts?.allowWarmUp ?? ALLOW_WARM_UP,
      group: input?.circuitGroup ?? 'default',
    }

    const originalMethod = descriptor.value

    descriptor.value = async function (...args: unknown[]) {
      const className = target.constructor.name
      const instanceKey = `${className}:${opt.group}`

      if (!breakerInstances.has(instanceKey)) {
        const breaker = new OpossumCircuitBreaker(originalMethod.bind(this), opt)
        breakerInstances.set(instanceKey, breaker)

        const classEvents = events.get(className) || new Map()
        const circuitEvents = classEvents.get(opt.group) || new Map()

        for (const [eventName, methodName] of circuitEvents) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (eventName !== 'fallback' && typeof (this as any)[`${methodName}`] === 'function') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            breaker.on(eventName as any, (this as any)[`${methodName}`].bind(this))
          }
        }

        const fallbackMethod = circuitEvents.get('fallback')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (fallbackMethod && typeof (this as any)[`${fallbackMethod}`] === 'function') {
          breaker.fallback(async (args: unknown, error: Error) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
 * Decorator para registrar eventos no circuito.
 * Os eventos são armazenados e usados pelo `CircuitBreaker` quando ele for instanciado.
 */
export function onEvent({ eventName, circuitGroup = 'default' }: OnEventInput) {
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
