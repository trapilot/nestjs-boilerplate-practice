export interface INotificationDispatchPushPayload {
  pushId: number
}

export interface INotificationSendPushPayload {
  pushId: number
  memberIds: number[]
}
