import { ApiProperty, OmitType } from '@nestjs/swagger'
import { ENUM_NOTIFICATION_CHANNEL, ENUM_NOTIFICATION_TYPE } from '@prisma/client'
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
} from 'class-validator'
import { ToArray, ToBoolean, ToNumber, ToObject, ToString } from 'lib/nest-core'
import { RequestContentDto, RequestParagraphDto, RequestSentenceDto } from 'lib/nest-web'
import { PushRequestCreateDto } from 'modules/push/dtos'
import { ENUM_NOTIFICATION_REF_TYPE } from '../enums'

export class NotificationPushCreateDto extends OmitType(PushRequestCreateDto, ['notificationId']) {}

export class NotificationRequestCreateDto {
  @IsNotEmpty()
  @IsEnum(ENUM_NOTIFICATION_CHANNEL)
  @ToString()
  @ApiProperty({
    required: true,
    enum: ENUM_NOTIFICATION_CHANNEL,
    example: ENUM_NOTIFICATION_CHANNEL.SMS,
  })
  channel: ENUM_NOTIFICATION_CHANNEL

  @IsNotEmpty()
  @IsEnum(ENUM_NOTIFICATION_TYPE)
  @ToString()
  @ApiProperty({
    required: true,
    enum: ENUM_NOTIFICATION_TYPE,
    example: ENUM_NOTIFICATION_TYPE.TEXT,
  })
  type: ENUM_NOTIFICATION_TYPE

  @IsOptional()
  @IsNumber()
  @ToNumber()
  @ApiProperty({ required: false, example: '' })
  refId: number

  @IsOptional()
  @IsEnum(ENUM_NOTIFICATION_REF_TYPE)
  @ToString()
  @ApiProperty({
    required: false,
    enum: ENUM_NOTIFICATION_REF_TYPE,
    example: ENUM_NOTIFICATION_REF_TYPE.TEXT,
  })
  refType: string

  @IsNotEmpty()
  @IsObject()
  @ToObject({ type: RequestSentenceDto })
  @ApiProperty({ required: true, type: RequestSentenceDto })
  title: any

  @IsNotEmpty()
  @IsObject()
  @ToObject({ type: RequestParagraphDto })
  @ApiProperty({ required: true, type: RequestParagraphDto })
  description: any

  @IsNotEmpty()
  @IsObject()
  @ToObject({ type: RequestContentDto })
  @ApiProperty({ required: true, type: RequestContentDto })
  content: any

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  @ApiProperty({ required: false, example: true })
  isActive: boolean

  @IsOptional()
  @IsArray()
  @ToArray({ type: NotificationPushCreateDto })
  @ApiProperty({ required: false, isArray: true, type: NotificationPushCreateDto })
  pushes: NotificationPushCreateDto[]

  @IsOptional()
  @IsArray()
  @ToArray({ type: Number })
  @ApiProperty({ required: false, isArray: true, type: Number })
  groupIds: number[]
}
