import { Notification, Push } from '@runtime/prisma-client'

export type TPush = Push & {
  notification?: Notification
}

export type TNotification = Notification & {
  pushes?: TPush[]
}
