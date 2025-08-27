import { ApiProperty } from '@nestjs/swagger'
import { IsObject } from 'class-validator'
import { ILoggerData, ILoggerMetadata } from 'lib/nest-logger'

export class AuditRequestEntryDto {
  @ApiProperty({
    required: true,
    nullable: false,
  })
  @IsObject()
  meta: ILoggerMetadata

  @ApiProperty({
    required: true,
    nullable: false,
  })
  @IsObject()
  data: ILoggerData
}
