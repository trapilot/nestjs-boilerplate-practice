import { OmitType } from '@nestjs/swagger'
import { NotificationRequestCreateDto } from './notification.request.create.dto'

export class NotificationRequestUpdateDto extends OmitType(NotificationRequestCreateDto, [
  'channel',
  'type',
]) {}
