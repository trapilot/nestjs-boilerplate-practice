export interface IPushSendPayload<T = unknown> {
  token: string
  title: string
  body: string
  data?: T
}

export interface IPushSendResult {
  vendor: string
  messageId?: string
  dryRun?: boolean
  metadata?: {
    [key: string]: string
  }
}

export interface PushDriver {
  readonly name: string

  send<T>(payload: IPushSendPayload<T>): Promise<IPushSendResult>
}
