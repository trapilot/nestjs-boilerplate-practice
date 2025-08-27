import { faker } from '@faker-js/faker'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'
import { ENUM_MESSAGE_LANGUAGE, ToString } from 'lib/nest-core'

export class RequestSentenceDto {
  @IsNotEmpty()
  @IsString()
  @ToString()
  @ApiProperty({ required: true, example: faker.lorem.sentence() })
  [ENUM_MESSAGE_LANGUAGE.EN]: string;

  @IsNotEmpty()
  @IsString()
  @ToString()
  @ApiProperty({ required: true, example: faker.lorem.sentence() })
  [ENUM_MESSAGE_LANGUAGE.VI]: string
}

export class RequestParagraphDto {
  @IsNotEmpty()
  @IsString()
  @ToString()
  @ApiProperty({ required: true, example: faker.lorem.paragraph() })
  [ENUM_MESSAGE_LANGUAGE.EN]: string;

  @IsNotEmpty()
  @IsString()
  @ToString()
  @ApiProperty({ required: true, example: faker.lorem.paragraph() })
  [ENUM_MESSAGE_LANGUAGE.VI]: string
}

export class RequestContentDto {
  @IsNotEmpty()
  @IsString()
  @ToString()
  @ApiProperty({
    required: true,
    example: `<p>${faker.lorem.paragraphs({ min: 1, max: 5 }, '</p>')}</p>`,
  })
  [ENUM_MESSAGE_LANGUAGE.EN]: string;

  @IsNotEmpty()
  @IsString()
  @ToString()
  @ApiProperty({
    required: true,
    example: `<p>${faker.lorem.paragraphs({ min: 1, max: 5 }, '</p>')}</p>`,
  })
  [ENUM_MESSAGE_LANGUAGE.VI]: string
}
