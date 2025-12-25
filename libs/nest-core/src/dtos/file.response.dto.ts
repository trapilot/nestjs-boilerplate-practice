import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import { UrlUtil } from 'lib/nest-core'

export class FileResponseDto {
  @ApiProperty({ type: 'number', example: 2 })
  @Expose()
  id: number

  @ApiProperty({ type: 'number', example: 0 })
  @Expose()
  level: number

  @ApiProperty({ type: 'string', example: '' })
  @Transform(({ obj }) => {
    if (obj.type === 'FILE') {
      return UrlUtil.build(obj?.fullPath ?? obj.path)
    }
    return null
  })
  @Expose()
  link: string

  @ApiProperty({ type: 'string', example: '' })
  @Expose()
  path: string

  @ApiProperty({ type: 'string', example: 'FILE' })
  @Expose()
  type: string

  @ApiProperty({ type: 'string', example: '' })
  @Expose()
  mime: string

  @ApiProperty({ type: 'number', example: 0 })
  @Expose()
  size: number

  @ApiProperty({ type: 'number', example: 0 })
  @Expose()
  width: number

  @ApiProperty({ type: 'number', example: 0 })
  @Expose()
  height: number

  @ApiProperty({ type: 'string', example: '' })
  @Expose()
  name: string

  @ApiProperty({ type: 'string', example: '' })
  @Expose()
  alias: string

  @ApiProperty({ type: 'string', example: '' })
  @Transform(({ obj }) => {
    if (obj.type === 'FILE') {
      if (obj?.mime) return obj.mime.split('/').pop()
      return (obj?.fullPath || obj.path || '').split('.').pop()
    }
    return null
  })
  @Expose()
  extension: string

  @Type(() => Date)
  @Expose()
  createdAt: Date
}
