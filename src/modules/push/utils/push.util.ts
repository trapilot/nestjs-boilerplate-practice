import { ENUM_PUSH_TYPE, Prisma } from '@prisma/client'
import { DateUtil } from 'lib/nest-core'
import { NotificationPushCreateDto } from 'modules/notification/dtos'

export class PushUtil {
  static canWeekday(type: ENUM_PUSH_TYPE): boolean {
    return ENUM_PUSH_TYPE.DAILY === type
  }

  static canDay(type: ENUM_PUSH_TYPE): boolean {
    return ENUM_PUSH_TYPE.MONTHLY === type || ENUM_PUSH_TYPE.YEARLY === type
  }

  static canMonth(type: ENUM_PUSH_TYPE): boolean {
    return ENUM_PUSH_TYPE.YEARLY === type
  }

  static isInstant(type: ENUM_PUSH_TYPE): boolean {
    return ENUM_PUSH_TYPE.INSTANT === type
  }

  static isSpecDate(type: ENUM_PUSH_TYPE): boolean {
    return ENUM_PUSH_TYPE.DATETIME === type
  }

  static isLoop(type: ENUM_PUSH_TYPE): boolean {
    return (
      ENUM_PUSH_TYPE.DAILY === type ||
      ENUM_PUSH_TYPE.WEEKLY === type ||
      ENUM_PUSH_TYPE.MONTHLY === type ||
      ENUM_PUSH_TYPE.YEARLY === type
    )
  }

  static isOnce(type: ENUM_PUSH_TYPE): boolean {
    return ENUM_PUSH_TYPE.INSTANT === type || ENUM_PUSH_TYPE.DATETIME === type
  }

  private static getScheduledDate(dto: NotificationPushCreateDto): Date {
    if (dto.type === ENUM_PUSH_TYPE.INSTANT) {
      return new Date()
    }
    if (dto.type === ENUM_PUSH_TYPE.DATETIME) {
      return DateUtil.mergeDate(dto.executeDate, dto.executeTime)
    }
    return DateUtil.mergeDate(dto.startDate, dto.executeTime)
  }

  static makeDto(dto: NotificationPushCreateDto): Prisma.PushCreateManyNotificationInput {
    const dateSchedule = this.getScheduledDate(dto)
    const dateExtract = DateUtil.extractDate(dateSchedule)

    return {
      ...dto,
      hours: dateExtract.hour,
      minutes: dateExtract.minute,
      seconds: dateExtract.second,
      scheduledAt: dateExtract.date,
    }
  }

  static makeDtos(dtos: NotificationPushCreateDto[]): Prisma.PushCreateManyNotificationInput[] {
    return dtos.map((dto) => this.makeDto(dto))
  }
}
