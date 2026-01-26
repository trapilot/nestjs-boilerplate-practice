import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'
import { EnumAppLanguage, ToString } from 'lib/nest-core'

export class RequestSentenceDto {
  @IsNotEmpty()
  @IsString()
  @ToString()
  @ApiProperty({
    required: true,
    example: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
  })
  [EnumAppLanguage.EN]: string;

  @IsNotEmpty()
  @IsString()
  @ToString()
  @ApiProperty({
    required: true,
    example: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi u....',
  })
  [EnumAppLanguage.VI]: string
}

export class RequestParagraphDto {
  @IsNotEmpty()
  @IsString()
  @ToString()
  @ApiProperty({
    required: true,
    example: 'Lorem ipsum dolor sit amet c',
  })
  [EnumAppLanguage.EN]: string;

  @IsNotEmpty()
  @IsString()
  @ToString()
  @ApiProperty({
    required: true,
    example: 'Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fri',
  })
  [EnumAppLanguage.VI]: string
}

export class RequestContentDto {
  @IsNotEmpty()
  @IsString()
  @ToString()
  @ApiProperty({
    required: true,
    example: `<p>
    <p>Lorem ipsum dolor sit amet consectetur adipiscing elit.</p>
    <p>Quisque faucibus ex sapien vitae pellentesque sem placerat.</p>
    <p>In id cursus mi pretium tellus duis convallis</p>
    </p>`,
  })
  [EnumAppLanguage.EN]: string;

  @IsNotEmpty()
  @IsString()
  @ToString()
  @ApiProperty({
    required: true,
    example: `<p>
    <p>Lorem ipsum dolor sit amet consectetur adipiscing elit.</p>
    <p>Quisque faucibus ex sapien vitae pellentesque sem placerat.</p>
    <p>In id cursus mi pretium tellus duis convallis</p>
    </p>`,
  })
  [EnumAppLanguage.VI]: string
}
