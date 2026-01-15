import { ApiProperty, OmitType } from '@nestjs/swagger'
import { EnumNotificationChannel, EnumNotificationMethod } from '@runtime/prisma-client'
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
} from 'class-validator'
import { EnumMessageRefType, ToArray, ToBoolean, ToNumber, ToObject, ToString } from 'lib/nest-core'
import { RequestContentDto, RequestParagraphDto, RequestSentenceDto } from 'lib/nest-web'
import { PushRequestCreateDto } from 'modules/push'

export class NotificationPushCreateDto extends OmitType(PushRequestCreateDto, ['notificationId']) {}

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
  @IsEnum(EnumMessageRefType)
  @ToString()
  @ApiProperty({
    required: false,
    enum: EnumMessageRefType,
    example: EnumMessageRefType.TEXT,
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
  @ToArray({ type: NotificationPushCreateDto })
  @ApiProperty({ required: false, isArray: true, type: NotificationPushCreateDto })
  pushes: NotificationPushCreateDto[]

  @IsOptional()
  @IsArray()
  @ToArray({ type: Number })
  @ApiProperty({ required: false, isArray: true, type: Number })
  groupIds: number[]
}
