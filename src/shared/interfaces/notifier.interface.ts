export interface INotificationPayload {
  to: string
  content: string
  subject?: string
  data?: {
    [key: string]: string
  }
}
