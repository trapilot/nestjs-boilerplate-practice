import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty } from 'class-validator'
import { ToString } from 'lib/nest-core'
import { EnumPointSchemaTrigger } from '../enums/point-schema.enum'

export class PointSchemaRequestCreateDto {
  @IsNotEmpty()
  @IsEnum(EnumPointSchemaTrigger)
  @ToString()
  @ApiProperty({
    required: true,
    enum: EnumPointSchemaTrigger,
    enumName: 'EnumPointSchemaTrigger',
    example: EnumPointSchemaTrigger.WELCOME_TIER,
  })
  trigger: EnumPointSchemaTrigger
}
