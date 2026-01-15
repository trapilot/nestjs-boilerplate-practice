import { faker } from '@faker-js/faker'
import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'
import { EnumMessageLanguage } from 'lib/nest-core'

export class ResponseLocaleDto {
  @ApiProperty({ example: faker.lorem.sentence() })
  @Transform(({ value }) => value ?? '')
  @Expose()
  [EnumMessageLanguage.EN]: string;

  @ApiProperty({ example: faker.lorem.sentence() })
  @Transform(({ value }) => value ?? '')
  @Expose()
  [EnumMessageLanguage.VI]: string
}
