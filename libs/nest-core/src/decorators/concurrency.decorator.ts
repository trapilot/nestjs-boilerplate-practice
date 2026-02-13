import { IRunnerQueueOptions, RunnerService } from '../services'

export interface IConcurrencyOptions extends IRunnerQueueOptions {
  queue: string
  worker?: string
}

export function Concurrency(options: IConcurrencyOptions) {
  return function (target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const runner: RunnerService = this.runnerService

      if (!runner) {
        throw new Error(
          `RunnerService not found in ${target.constructor.name}.
          Inject it as: constructor(private readonly runnerService: RunnerService)`,
        )
      }

      // Allow method to preprocess input
      const processedPayload = await originalMethod.apply(this, args)

      // If worker defined → CPU-bound execution
      if (options.worker) {
        return runner.runWorker(options.queue, options.worker, processedPayload, options)
      }

      // Otherwise → normal queue execution
      return runner.run(options.queue, async () => processedPayload, options)
    }

    return descriptor
  }
}
