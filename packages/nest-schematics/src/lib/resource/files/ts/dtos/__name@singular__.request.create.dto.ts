import { faker } from '@faker-js/faker'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator'
import { ToString } from 'lib/nest-core'

export class <%= singular(classify(name)) %>RequestCreateDto {
  @IsNotEmpty()
  @IsString()
  @ToString()
  @MinLength(1)
  @MaxLength(30)
  @ApiProperty({ required: true, example: faker.person.lastName() })
  name: string
}
