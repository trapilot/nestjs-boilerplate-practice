export interface ITransportConfig {
  url: string
  from?: string
}

export interface IMailerSendResult {
  dryRun: boolean
  message: string
}
