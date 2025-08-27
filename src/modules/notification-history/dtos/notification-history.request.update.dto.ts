import { OmitType } from '@nestjs/swagger'
import { NotificationHistoryRequestCreateDto } from './notification-history.request.create.dto'

export class NotificationHistoryRequestUpdateDto extends OmitType(
  NotificationHistoryRequestCreateDto,
  [],
) {}
