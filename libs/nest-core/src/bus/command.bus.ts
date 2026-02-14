import { Injectable, Logger } from '@nestjs/common'
import { ICommand, ICommandBus } from '../interfaces/bus.interface'
import { RunnerService } from '../services/runner.service'

@Injectable()
export class CommandBus implements ICommandBus {
  private readonly logger = new Logger(CommandBus.name)

  /**
   * Max queued (waiting + pending) jobs per command topic.
   */
  private readonly maxQueueSize: number = 1000

  /**
   * Command handlers registry
   * Key: commandName (topic:vX)
   */
  private readonly handlers = new Map<string, (command: ICommand<any>) => Promise<any> | any>()

  constructor(private readonly runner: RunnerService) {}

  // =====================================================
  // Execute Command
  // =====================================================

  async execute<T, R = any>(command: ICommand<T>): Promise<R> {
    const commandName = this.buildCommandName(command)
    const queueName = this.buildQueueName(command)

    const handler = this.handlers.get(commandName)
    if (!handler) {
      throw new Error(`No handler registered for command ${commandName}`)
    }

    // ---------- Backpressure ----------
    const stats = this.runner.stats(queueName)
    if (stats && stats.size + stats.pending >= this.maxQueueSize) {
      this.logger.error(
        `Backpressure: Queue ${queueName} is full (${stats.size + stats.pending}). Rejecting command.`,
      )
      throw new Error(`Command queue is full: ${commandName}`)
    }

    return this.runner.run(queueName, () => handler(command), {
      concurrency: 5,
      retry: {
        retries: 2, // usually lower than events
        minDelayMs: 200,
      },
    })
  }

  // =====================================================
  // Register Handler
  // =====================================================

  register<T, R = any>(topic: string, handler: (command: ICommand<T>) => Promise<R> | R): void {
    const key = topic

    if (this.handlers.has(key)) {
      throw new Error(`Handler already registered for command ${key}`)
    }

    this.handlers.set(key, handler)
  }

  // =====================================================
  // Helpers
  // =====================================================

  private buildCommandName(command: ICommand): string {
    return `${command.topic}:v${command.version}`
  }

  private buildQueueName(command: ICommand): string {
    return `queue:command-bus:${command.topic}`
  }
}
