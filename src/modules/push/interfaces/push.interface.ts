import { Notification, Push, PushGroup, PushGroupNotificationMixins } from '@runtime/prisma-client'

interface TPushGroupNotificationMixins extends PushGroupNotificationMixins {
  group?: PushGroup
  notification?: Notification
}

export interface TPush extends Push {
  notification?: Notification
  pivotGroups?: TPushGroupNotificationMixins[]
}

export interface IPushHistoryData {
  pushHistoryId: number
  memberId: number
  refId: number
  refType: string
  refValue?: string
  refDischarge?: Date | string
}

export interface IPushMessageData {
  historyId: string
  refId: string
  refType: string
  [key: string]: string
}
