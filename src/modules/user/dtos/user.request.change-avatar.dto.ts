import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

export class UserRequestChangeAvatarDto {
  @IsOptional()
  @ApiProperty({ required: false, type: 'string', format: 'binary' })
  avatar: string
}
