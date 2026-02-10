import { ApiProperty } from '@nestjs/swagger'
import { EnumPointAction, EnumPointReason } from '@runtime/prisma-client'
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator'
import { ToNumber, ToString } from 'lib/nest-core'

export class MemberPointRequestCreateDto {
  @IsNotEmpty()
  @IsNumber()
  @ToNumber()
  @ApiProperty({ required: true, example: 1 })
  memberId: number

  @IsNotEmpty()
  @IsNumber()
  @ToNumber()
  @ApiProperty({ required: true, example: 1 })
  point: number

  @IsNotEmpty()
  @IsEnum(EnumPointReason)
  @ToString()
  @ApiProperty({
    required: true,
    enum: EnumPointReason,
    enumName: 'EnumPointReason',
    example: EnumPointReason.ADJUST,
  })
  reason: EnumPointReason

  @IsNotEmpty()
  @IsEnum(EnumPointAction)
  @ToString()
  @ApiProperty({
    required: true,
    enum: EnumPointAction,
    enumName: 'EnumPointAction',
    example: EnumPointAction.PLUS,
  })
  action: EnumPointAction
}
