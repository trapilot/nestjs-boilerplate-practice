import { ApiProperty } from '@nestjs/swagger'
import {
  EnumNotificationChannel,
  EnumNotificationMethod,
  EnumPushType,
} from '@runtime/prisma-client'
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
} from 'class-validator'
import {
  EnumDateFormat,
  ToArray,
  ToBoolean,
  ToDate,
  ToDuration,
  ToNumber,
  ToObject,
  ToString,
  TransformIf,
} from 'lib/nest-core'
import {
  IsDuration,
  RequestContentDto,
  RequestParagraphDto,
  RequestSentenceDto,
} from 'lib/nest-web'
import { EnumNotificationRefType } from '../enums'
import { NotificationUtil } from '../helpers'

export class NotificationPushDto {
  @IsNotEmpty()
  @IsEnum(EnumPushType)
  @ToString()
  @ApiProperty({ required: true, enum: EnumPushType, example: EnumPushType.INSTANT })
  type: EnumPushType

  @IsNotEmpty()
  @IsDuration()
  @ToDuration()
  @TransformIf((obj: NotificationPushDto) => !NotificationUtil.isInstant(obj.type))
  @ApiProperty({ required: true, example: '' })
  executeTime: string

  @IsNotEmpty()
  @IsDate()
  @ToDate({ format: EnumDateFormat.DB_DATE })
  @TransformIf((obj: NotificationPushDto) => NotificationUtil.isSpecDate(obj.type))
  @ApiProperty({ required: true, example: new Date(Date.now() - 30000 * 3600) })
  executeDate: string

  @IsOptional()
  @IsNumber()
  @ToNumber()
  @TransformIf((obj: NotificationPushDto) => NotificationUtil.canWeekday(obj.type))
  @ApiProperty({ required: false, example: '' })
  weekday: number

  @IsOptional()
  @IsNumber()
  @ToNumber()
  @TransformIf((obj: NotificationPushDto) => NotificationUtil.canDay(obj.type))
  @ApiProperty({ required: false, example: '' })
  day: number

  @IsOptional()
  @IsNumber()
  @ToNumber()
  @TransformIf((obj: NotificationPushDto) => NotificationUtil.canMonth(obj.type))
  @ApiProperty({ required: false, example: '' })
  month: number

  @IsOptional()
  @IsDate()
  @ToDate({ startOfDay: true })
  @TransformIf((obj: NotificationPushDto) => NotificationUtil.isLoop(obj.type))
  @ApiProperty({ required: false, example: new Date(Date.now() + 30000 * 3600) })
  startDate: Date

  @IsOptional()
  @IsDate()
  @ToDate({ endOfDay: true })
  @TransformIf((obj: NotificationPushDto) => NotificationUtil.isLoop(obj.type))
  @ApiProperty({ required: false, example: new Date(Date.now() + 60000 * 3600) })
  untilDate: Date

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  @ApiProperty({ required: false, example: true })
  isActive: boolean
}

export class NotificationRequestCreateDto {
  @IsNotEmpty()
  @IsEnum(EnumNotificationChannel)
  @ToString()
  @ApiProperty({
    required: true,
    enum: EnumNotificationChannel,
    example: EnumNotificationChannel.SMS,
  })
  channel: EnumNotificationChannel

  @IsNotEmpty()
  @IsEnum(EnumNotificationMethod)
  @ToString()
  @ApiProperty({
    required: true,
    enum: EnumNotificationMethod,
    example: EnumNotificationMethod.TEXT,
  })
  type: EnumNotificationMethod

  @IsOptional()
  @IsNumber()
  @ToNumber()
  @ApiProperty({ required: false, example: '' })
  refId: number

  @IsOptional()
  @IsEnum(EnumNotificationRefType)
  @ToString()
  @ApiProperty({
    required: false,
    enum: EnumNotificationRefType,
    example: EnumNotificationRefType.TEXT,
  })
  refType: string

  @IsNotEmpty()
  @IsObject()
  @ToObject({ type: RequestSentenceDto })
  @ApiProperty({ required: true, type: RequestSentenceDto })
  title: object

  @IsNotEmpty()
  @IsObject()
  @ToObject({ type: RequestParagraphDto })
  @ApiProperty({ required: true, type: RequestParagraphDto })
  description: object

  @IsNotEmpty()
  @IsObject()
  @ToObject({ type: RequestContentDto })
  @ApiProperty({ required: true, type: RequestContentDto })
  content: object

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  @ApiProperty({ required: false, example: true })
  isActive: boolean

  @IsOptional()
  @IsArray()
  @ToArray({ type: NotificationPushDto })
  @ApiProperty({ required: false, isArray: true, type: NotificationPushDto })
  pushes: NotificationPushDto[]

  @IsOptional()
  @IsArray()
  @ToArray({ type: Number })
  @ApiProperty({ required: false, isArray: true, type: Number })
  groupIds: number[]
}
