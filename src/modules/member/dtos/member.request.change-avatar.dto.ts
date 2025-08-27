import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

export class MemberChangeAvatarRequestDto {
  @IsOptional()
  @ApiProperty({ required: false, type: 'string', format: 'binary' })
  avatar: string
}
