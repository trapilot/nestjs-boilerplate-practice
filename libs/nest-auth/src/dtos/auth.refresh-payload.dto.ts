import { ApiProperty, OmitType } from '@nestjs/swagger'
import { AuthJwtAccessPayloadDto } from './auth.access-payload.dto'

class ResponseRefreshUserDto {
  @ApiProperty({
    required: true,
    nullable: false,
  })
  id: number
}

export class AuthJwtRefreshPayloadDto extends OmitType(AuthJwtAccessPayloadDto, ['user'] as const) {
  @ApiProperty({
    required: true,
    nullable: false,
    type: () => ResponseRefreshUserDto,
  })
  user: ResponseRefreshUserDto
}
