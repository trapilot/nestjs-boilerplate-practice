import { ApiProperty } from '@nestjs/swagger'
import { AuthJwtAccessPayloadDto } from './auth.jwt-access.payload.dto'

class ResponseRefreshUserDto {
  @ApiProperty({
    required: true,
    nullable: false,
  })
  id: number
}

export class AuthJwtRefreshPayloadDto extends AuthJwtAccessPayloadDto<ResponseRefreshUserDto> {}
