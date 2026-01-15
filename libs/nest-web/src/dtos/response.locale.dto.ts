import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'
import { EnumMessageLanguage } from 'lib/nest-core'

export class ResponseLocaleDto {
  @ApiProperty({ example: 'Lorem ipsum dolor sit amet consectetur adipiscing elit.' })
  @Transform(({ value }) => value ?? '')
  @Expose()
  [EnumMessageLanguage.EN]: string;

  @ApiProperty({ example: 'Lorem ipsum dolor sit amet consectetur adipiscing elit.' })
  @Transform(({ value }) => value ?? '')
  @Expose()
  [EnumMessageLanguage.VI]: string
}
