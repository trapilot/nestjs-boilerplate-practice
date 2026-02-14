import { Injectable } from '@nestjs/common'
import { EnumPushType, Prisma } from '@runtime/prisma-client'
import { DateUtil } from 'lib/nest-core'
import { NotificationPushDto } from '../dtos/notification.request.create.dto'

@Injectable()
export class NotificationUtil {
  static canWeekday(type: EnumPushType): boolean {
    return EnumPushType.DAILY === type
  }

  static canDay(type: EnumPushType): boolean {
    return EnumPushType.MONTHLY === type || EnumPushType.YEARLY === type
  }

  static canMonth(type: EnumPushType): boolean {
    return EnumPushType.YEARLY === type
  }

  static isOnce(type: EnumPushType): boolean {
    return EnumPushType.ONCE === type
  }

  static isLoop(type: EnumPushType): boolean {
    return (
      EnumPushType.DAILY === type ||
      EnumPushType.WEEKLY === type ||
      EnumPushType.MONTHLY === type ||
      EnumPushType.YEARLY === type
    )
  }

  static makeDto(dto: NotificationPushDto): Prisma.PushCreateManyNotificationInput {
    const { executeDate, executeTime, sinceDate, ...data } = dto
    const dateSchedule =
      dto.type === EnumPushType.ONCE
        ? DateUtil.mergeDate(executeDate, executeTime)
        : DateUtil.mergeDate(sinceDate, executeTime)
    const dateExtract = DateUtil.extractDate(dateSchedule)

    return {
      ...data,
      sinceDate,
      hour: dateExtract.hour,
      minute: dateExtract.minute,
      second: dateExtract.second,
      startAt: dateExtract.date,
    }
  }

  static makeDtos(dtos: NotificationPushDto[]): Prisma.PushCreateManyNotificationInput[] {
    return dtos.map(dto => this.makeDto(dto))
  }
}
