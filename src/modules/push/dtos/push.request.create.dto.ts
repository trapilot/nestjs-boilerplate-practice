import { faker } from '@faker-js/faker'
import { ApiProperty } from '@nestjs/swagger'
import { ENUM_PUSH_TYPE } from '@prisma/client'
import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator'
import {
  ENUM_DATE_FORMAT,
  ToBoolean,
  ToDate,
  ToDuration,
  ToNumber,
  ToString,
  TransformIf,
} from 'lib/nest-core'
import { IsDuration } from 'lib/nest-web'
import { PushHelper } from '../helpers'

export class PushRequestCreateDto {
  @IsNotEmpty()
  @IsNumber()
  @ToNumber()
  @ApiProperty({ required: true, example: 1 })
  notificationId: number

  @IsNotEmpty()
  @IsEnum(ENUM_PUSH_TYPE)
  @ToString()
  @ApiProperty({ required: true, enum: ENUM_PUSH_TYPE, example: ENUM_PUSH_TYPE.INSTANT })
  type: ENUM_PUSH_TYPE

  @IsNotEmpty()
  @IsDuration()
  @ToDuration()
  @TransformIf((obj: PushRequestCreateDto) => !PushHelper.isInstant(obj.type))
  @ApiProperty({ required: true, example: '' })
  executeTime: string

  @IsNotEmpty()
  @IsDate()
  @ToDate({ format: ENUM_DATE_FORMAT.DB_DATE })
  @TransformIf((obj: PushRequestCreateDto) => PushHelper.isSpecDate(obj.type))
  @ApiProperty({ required: true, example: faker.date.future() })
  executeDate: string

  @IsOptional()
  @IsNumber()
  @ToNumber()
  @TransformIf((obj: PushRequestCreateDto) => PushHelper.canWeekday(obj.type))
  @ApiProperty({ required: false, example: '' })
  weekday: number

  @IsOptional()
  @IsNumber()
  @ToNumber()
  @TransformIf((obj: PushRequestCreateDto) => PushHelper.canDay(obj.type))
  @ApiProperty({ required: false, example: '' })
  day: number

  @IsOptional()
  @IsNumber()
  @ToNumber()
  @TransformIf((obj: PushRequestCreateDto) => PushHelper.canMonth(obj.type))
  @ApiProperty({ required: false, example: '' })
  month: number

  @IsOptional()
  @IsDate()
  @ToDate({ startOfDay: true })
  @TransformIf((obj: PushRequestCreateDto) => PushHelper.isLoop(obj.type))
  @ApiProperty({ required: false, example: faker.date.future() })
  startDate: Date

  @IsOptional()
  @IsDate()
  @ToDate({ endOfDay: true })
  @TransformIf((obj: PushRequestCreateDto) => PushHelper.isLoop(obj.type))
  @ApiProperty({ required: false, example: faker.date.future() })
  untilDate: Date

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  @ApiProperty({ required: false, example: true })
  isActive: boolean
}
