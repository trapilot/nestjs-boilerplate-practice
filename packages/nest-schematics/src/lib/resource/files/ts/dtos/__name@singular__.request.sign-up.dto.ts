import { OmitType } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'
import { ToString } from 'lib/nest-core'
import { <%= singular(classify(name)) %>RequestCreateDto } from './<%= singular(name) %>.request.create.dto'

export class <%= singular(classify(name)) %>RequestSignUpDto extends OmitType(<%= singular(classify(name)) %>RequestCreateDto, [] as const) {
  @IsNotEmpty()
  @IsString()
  @ToString()
  @ApiProperty({ required: true, example: process.env.MOCK_<%= singular(uppercased(name)) %>_PASS })
  password: string
}
