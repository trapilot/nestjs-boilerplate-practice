import { Processor } from '@nestjs/bullmq'
import { NestWorkerOptions } from '@nestjs/bullmq/dist/interfaces/worker-options.interface'
import { QUEUE_PROCESSOR_CONFIG_KEY } from '../constants'

export function QueueProcessor(
  name: string,
  options?: Omit<NestWorkerOptions, 'name'>
): ClassDecorator {
  // @note: currently there is no way to inject ConfigService into decorators
  return Processor(
    {
      name,
      configKey: QUEUE_PROCESSOR_CONFIG_KEY,
    },
    {
      name: `${process.env.APP_NAME}-${process.env.APP_ENV}:${name}:consumer`,
      ...options,
    }
  )
}
