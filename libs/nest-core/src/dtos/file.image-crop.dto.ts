import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNotEmpty, IsNumber } from 'class-validator'

export class FileImageCropDto {
  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  cl: number

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  ct: number

  @ApiProperty()
  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  cw: number

  @ApiProperty()
  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  ch: number
}
