import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNotEmpty } from 'class-validator'
import { ToArray } from 'lib/nest-core'

export class MemberCloseProfileRequestDto {
  @IsNotEmpty()
  @IsArray()
  @ToArray()
  @ApiProperty({
    required: true,
    example: ['Bad experience with mobile app', "Don't need the account anymore"],
  })
  reasons: string[]
}
