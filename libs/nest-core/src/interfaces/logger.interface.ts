export type TLoggerFn =
  | ((msg: string, ...args: any[]) => void)
  | ((obj: object, msg?: string, ...args: any[]) => void)

export interface ILoggerFileOptions {
  maxDays: number
  maxSize: number
}

export interface ILoggerFileConfig {
  default: ILoggerFileOptions
  [key: string]: ILoggerFileOptions
}

export interface ILoggerDebugInfo {
  memory: {
    rss: number
    heapUsed: number
  }
  uptime: number
}
