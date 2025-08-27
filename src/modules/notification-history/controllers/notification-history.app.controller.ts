import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { NOTIFICATION_HISTORY_DOC_OPERATION } from '../constants'
import { NotificationHistoryService } from '../services'

@ApiTags(NOTIFICATION_HISTORY_DOC_OPERATION)
@Controller({ version: '1', path: '/notification-histories' })
export class NotificationHistoryAppController {
  constructor(protected readonly notificationHistoryService: NotificationHistoryService) {}
}
