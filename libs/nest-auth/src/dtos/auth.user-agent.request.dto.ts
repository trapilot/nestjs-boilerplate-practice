import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'

class AuthUserAgentBrowserRequestDto {
  @ApiProperty({
    required: false,
    example: 'Chrome',
  })
  name?: string

  @ApiProperty({
    required: false,
    example: '112.0.5615.49',
  })
  version?: string

  @ApiProperty({
    required: false,
    example: '112',
  })
  major?: string

  @ApiProperty({
    required: false,
    example: 'mobile',
  })
  type?: string
}

class AuthUserAgentCpuRequestDto {
  @ApiProperty({
    required: false,
    example: 'amd64',
  })
  architecture?: string
}

class AuthUserAgentDeviceRequestDto {
  @ApiProperty({
    required: false,
    example: 'mobile',
  })
  type?: string

  @ApiProperty({
    required: false,
    example: 'Apple',
  })
  vendor?: string

  @ApiProperty({
    required: false,
    example: 'iPhone',
  })
  model?: string
}

class AuthUserAgentEngineRequestDto {
  @ApiProperty({
    required: false,
    example: 'WebKit',
  })
  name?: string

  @ApiProperty({
    required: false,
    example: '537.36',
  })
  version?: string
}

class AuthUserAgentOsRequestDto {
  @ApiProperty({
    required: false,
    example: 'iOS',
  })
  name?: string

  @ApiProperty({
    required: false,
    example: '16.3.1',
  })
  version?: string
}

export class AuthUserAgentRequestDto {
  @ApiProperty({
    required: false,
  })
  ua?: string

  @ApiProperty({
    required: false,
    type: AuthUserAgentBrowserRequestDto,
  })
  @Type(() => AuthUserAgentBrowserRequestDto)
  browser?: AuthUserAgentBrowserRequestDto

  @ApiProperty({
    required: false,
    type: AuthUserAgentCpuRequestDto,
  })
  @Type(() => AuthUserAgentCpuRequestDto)
  cpu?: AuthUserAgentCpuRequestDto

  @ApiProperty({
    required: false,
    type: AuthUserAgentDeviceRequestDto,
  })
  @Type(() => AuthUserAgentDeviceRequestDto)
  device?: AuthUserAgentDeviceRequestDto

  @ApiProperty({
    required: false,
    type: AuthUserAgentEngineRequestDto,
  })
  @Type(() => AuthUserAgentEngineRequestDto)
  engine?: AuthUserAgentEngineRequestDto

  @ApiProperty({
    required: false,
    type: AuthUserAgentOsRequestDto,
  })
  @Type(() => AuthUserAgentOsRequestDto)
  os?: AuthUserAgentOsRequestDto
}
