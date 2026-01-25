import { v7 as uuidv7 } from 'uuid'
import { ScopeContext } from '../contexts'

export class LoggerUtil {
  static genReqId(): string {
    return uuidv7()
  }

  static getScopeContext(): string | undefined {
    const ctx = ScopeContext.current()
    return ctx?.logger?.context
  }

  static getDefaultContext(): string {
    return 'system'
  }

  static getContextOrDefault(): string {
    return this.getScopeContext() || this.getDefaultContext()
  }
}
