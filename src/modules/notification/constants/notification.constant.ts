import { EnumNotificationQueue } from '../enums/notification.enum'

export const NOTIFICATION_UPLOAD_IMAGE_PATH = `public/uploads/images/notifications`

export const NOTIFICATION_QUEUE_SCAN_VERSION = {
  [EnumNotificationQueue.PUSH_DISPATCH]: 1,
  [EnumNotificationQueue.SEND_PUSH]: 1,
} as const

export const NOTIFICATION_QUEUE_PROC_VERSION = {
  [EnumNotificationQueue.PUSH_DISPATCH]: 1,
  [EnumNotificationQueue.SEND_PUSH]: 1,
} as const
