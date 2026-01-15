import { EnumPushType, Prisma } from '@runtime/prisma-client'
import { DateUtil } from 'lib/nest-core'
import { NotificationPushCreateDto } from 'modules/notification'

export class PushUtil {
  static canWeekday(type: EnumPushType): boolean {
    return EnumPushType.DAILY === type
  }

  static canDay(type: EnumPushType): boolean {
    return EnumPushType.MONTHLY === type || EnumPushType.YEARLY === type
  }

  static canMonth(type: EnumPushType): boolean {
    return EnumPushType.YEARLY === type
  }

  static isInstant(type: EnumPushType): boolean {
    return EnumPushType.INSTANT === type
  }

  static isSpecDate(type: EnumPushType): boolean {
    return EnumPushType.DATETIME === type
  }

  static isLoop(type: EnumPushType): boolean {
    return (
      EnumPushType.DAILY === type ||
      EnumPushType.WEEKLY === type ||
      EnumPushType.MONTHLY === type ||
      EnumPushType.YEARLY === type
    )
  }

  static isOnce(type: EnumPushType): boolean {
    return EnumPushType.INSTANT === type || EnumPushType.DATETIME === type
  }

  private static getScheduledDate(dto: NotificationPushCreateDto): Date {
    if (dto.type === EnumPushType.INSTANT) {
      return new Date()
    }
    if (dto.type === EnumPushType.DATETIME) {
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
    return dtos.map(dto => this.makeDto(dto))
  }
}
