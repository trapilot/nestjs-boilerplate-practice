import { faker } from '@faker-js/faker'
import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'
import { ENUM_MESSAGE_LANGUAGE } from 'lib/nest-core'

export class ResponseLocaleDto {
  @ApiProperty({ example: faker.lorem.sentence() })
  @Transform(({ value }) => value ?? '')
  @Expose()
  [ENUM_MESSAGE_LANGUAGE.EN]: string;

  @ApiProperty({ example: faker.lorem.sentence() })
  @Transform(({ value }) => value ?? '')
  @Expose()
  [ENUM_MESSAGE_LANGUAGE.VI]: string
}
