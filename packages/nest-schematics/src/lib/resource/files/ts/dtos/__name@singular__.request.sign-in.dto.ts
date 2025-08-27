import { ApiHideProperty, ApiProperty, PickType } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ToBoolean, ToString } from 'lib/nest-core'
import { <%= singular(classify(name)) %>RequestSignUpDto } from './<%= singular(name) %>.request.sign-up.dto'

export class <%= singular(classify(name)) %>RequestSignInDto extends PickType(<%= singular(classify(name)) %>RequestSignUpDto, [
  'email',
  'phone',
] as const) {
  @IsNotEmpty()
  @IsString()
  @ToString()
  @ApiProperty({ required: true, example: process.env.MOCK_<%= singular(uppercased(name)) %>_PASS })
  password: string

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  // @ApiProperty({ required: false, example: true })
  @ApiHideProperty()
  rememberMe?: boolean
}
