import { Notification, Push, PushGroup, PushGroupNotificationMixins } from '@runtime/prisma-client'

type TPushGroupNotificationMixins = PushGroupNotificationMixins & {
  group?: PushGroup
  notification?: Notification
}

export type TPush = Push & {
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

export interface IPushAnalyticOptions {
  totalDevice: number
  members: {
    id: number
    locale: string
    isNotifiable: boolean
    devices: {
      isActive: boolean
      token: string
    }[]
  }[]
  notifications: {
    memberId: number
    refId: number
    refType: string
    refValue?: string
    refDischarge?: string | Date
  }[]
}
export interface IPushMemberGroup {
  [key: string]: IPushAnalyticOptions['members']
}
