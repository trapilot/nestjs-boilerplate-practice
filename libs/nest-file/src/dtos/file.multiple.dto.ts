import { ApiProperty } from '@nestjs/swagger'
import { IFile } from '../interfaces'

export class FileMultipleDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
      description: 'Multi file',
    },
  })
  files: IFile[]
}
