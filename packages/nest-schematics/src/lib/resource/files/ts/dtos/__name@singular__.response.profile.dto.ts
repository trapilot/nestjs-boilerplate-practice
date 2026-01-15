import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { ToPureString } from 'lib/nest-core'

export class <%= singular(classify(name)) %>ResponseProfileDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  id: number

  @Type(() => String)
  @Expose()
  email: string

  @ToPureString()
  @Expose()
  phone: string | null

  @Type(() => String)
  @Expose()
  name: string | null

  @Type(() => Date)
  @Expose()
  loginDate: Date | null

  @Type(() => Date)
  @Expose()
  createdAt: Date
}
