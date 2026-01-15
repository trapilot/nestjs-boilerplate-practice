import { faker } from '@faker-js/faker'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'
import { EnumMessageLanguage, ToString } from 'lib/nest-core'

export class RequestSentenceDto {
  @IsNotEmpty()
  @IsString()
  @ToString()
  @ApiProperty({ required: true, example: faker.lorem.sentence() })
  [EnumMessageLanguage.EN]: string;

  @IsNotEmpty()
  @IsString()
  @ToString()
  @ApiProperty({ required: true, example: faker.lorem.sentence() })
  [EnumMessageLanguage.VI]: string
}

export class RequestParagraphDto {
  @IsNotEmpty()
  @IsString()
  @ToString()
  @ApiProperty({ required: true, example: faker.lorem.paragraph() })
  [EnumMessageLanguage.EN]: string;

  @IsNotEmpty()
  @IsString()
  @ToString()
  @ApiProperty({ required: true, example: faker.lorem.paragraph() })
  [EnumMessageLanguage.VI]: string
}

export class RequestContentDto {
  @IsNotEmpty()
  @IsString()
  @ToString()
  @ApiProperty({
    required: true,
    example: `<p>${faker.lorem.paragraphs({ min: 1, max: 5 }, '</p>')}</p>`,
  })
  [EnumMessageLanguage.EN]: string;

  @IsNotEmpty()
  @IsString()
  @ToString()
  @ApiProperty({
    required: true,
    example: `<p>${faker.lorem.paragraphs({ min: 1, max: 5 }, '</p>')}</p>`,
  })
  [EnumMessageLanguage.VI]: string
}
