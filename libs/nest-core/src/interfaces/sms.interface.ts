export interface ISmsSendPayload {
  phone: string
  message: string
}

export interface ISmsSendResult {
  vendor: string
  messageId?: string
  dryRun?: boolean
}

export interface SmsDriver {
  readonly name: string

  send(payload: ISmsSendPayload): Promise<ISmsSendResult>
}
