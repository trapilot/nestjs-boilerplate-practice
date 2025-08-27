import { Logger, LoggerService } from '@nestjs/common'
import { IStep } from '../interfaces'

export class NestSaga<T = any> {
  private readonly logger: LoggerService

  steps: IStep<T>[] = []
  successful_steps: IStep<T>[] = []

  constructor(steps: IStep<T>[], logger?: LoggerService) {
    this.steps = steps
    this.successful_steps = []
    this.logger = logger ?? new Logger(NestSaga.name)
  }

  async execute(input: T) {
    for (const step of this.steps) {
      // Print the type name of the step using its type name
      this.logger.debug(`Invoking: ${step.constructor.name}`)

      // Attempt to invoke the step
      try {
        await step.invoke(input)

        this.successful_steps.unshift(step)
      } catch (invoke_error: any) {
        this.logger.debug(`Failed Step: ${step.constructor.name}`)

        for (const successful_step of this.successful_steps) {
          this.logger.debug(`Rolling back: ${successful_step.constructor.name}`)

          try {
            await successful_step.compensate(input)
          } catch (rollback_error: any) {
            this.logger.debug(`Rollback failed: ${JSON.stringify(rollback_error)}`)
          }
        }
        throw invoke_error
      }
    }
    return true
  }
}

export class SagaBuilder<T = any> {
  logger: LoggerService
  steps: IStep<T>[] = []

  private constructor(logger?: LoggerService) {
    this.logger = logger
    this.steps = []
  }

  static new(logger?: LoggerService): SagaBuilder {
    return new SagaBuilder(logger)
  }

  // Add a step to the builder
  add(step: IStep<T>): SagaBuilder {
    this.steps.push(step)
    return this
  }

  // Build the final Saga instance
  build(): NestSaga<T> {
    return new NestSaga(this.steps, this.logger)
  }
}
