import { ApiProperty } from '@nestjs/swagger'
import { EnumPushType } from '@runtime/prisma-client'
import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator'
import {
  EnumDateFormat,
  ToBoolean,
  ToDate,
  ToDuration,
  ToNumber,
  ToString,
  TransformIf,
} from 'lib/nest-core'
import { IsDuration } from 'lib/nest-web'
import { PushUtil } from '../utils'

export class PushRequestCreateDto {
  @IsNotEmpty()
  @IsNumber()
  @ToNumber()
  @ApiProperty({ required: true, example: 1 })
  notificationId: number

  @IsNotEmpty()
  @IsEnum(EnumPushType)
  @ToString()
  @ApiProperty({ required: true, enum: EnumPushType, example: EnumPushType.INSTANT })
  type: EnumPushType

  @IsNotEmpty()
  @IsDuration()
  @ToDuration()
  @TransformIf((obj: PushRequestCreateDto) => !PushUtil.isInstant(obj.type))
  @ApiProperty({ required: true, example: '' })
  executeTime: string

  @IsNotEmpty()
  @IsDate()
  @ToDate({ format: EnumDateFormat.DB_DATE })
  @TransformIf((obj: PushRequestCreateDto) => PushUtil.isSpecDate(obj.type))
  @ApiProperty({ required: true, example: new Date(Date.now() - 30000 * 3600) })
  executeDate: string

  @IsOptional()
  @IsNumber()
  @ToNumber()
  @TransformIf((obj: PushRequestCreateDto) => PushUtil.canWeekday(obj.type))
  @ApiProperty({ required: false, example: '' })
  weekday: number

  @IsOptional()
  @IsNumber()
  @ToNumber()
  @TransformIf((obj: PushRequestCreateDto) => PushUtil.canDay(obj.type))
  @ApiProperty({ required: false, example: '' })
  day: number

  @IsOptional()
  @IsNumber()
  @ToNumber()
  @TransformIf((obj: PushRequestCreateDto) => PushUtil.canMonth(obj.type))
  @ApiProperty({ required: false, example: '' })
  month: number

  @IsOptional()
  @IsDate()
  @ToDate({ startOfDay: true })
  @TransformIf((obj: PushRequestCreateDto) => PushUtil.isLoop(obj.type))
  @ApiProperty({ required: false, example: new Date(Date.now() + 30000 * 3600) })
  startDate: Date

  @IsOptional()
  @IsDate()
  @ToDate({ endOfDay: true })
  @TransformIf((obj: PushRequestCreateDto) => PushUtil.isLoop(obj.type))
  @ApiProperty({ required: false, example: new Date(Date.now() + 60000 * 3600) })
  untilDate: Date

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  @ApiProperty({ required: false, example: true })
  isActive: boolean
}
