import { AsyncLocalStorage } from 'async_hooks'
import { Logger } from 'pino'

export class LoggerStore {
  constructor(
    public logger: Logger,
    public responseLogger?: Logger,
  ) {}
}

export const LoggerContext = new AsyncLocalStorage<LoggerStore>()
