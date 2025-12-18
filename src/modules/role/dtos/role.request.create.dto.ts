import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator'
import { ToArray, ToBoolean, ToString } from 'lib/nest-core'
import { RolePermissionRequestCreateDto } from './role-permission.request.create.dto'

export class RoleRequestCreateDto {
  @IsOptional()
  @IsString()
  @ToString()
  @MinLength(3)
  @MaxLength(30)
  // @ApiProperty({ required: true, example: 'ADMIN' })
  @ApiHideProperty()
  code: string

  @IsNotEmpty()
  @IsString()
  @ToString()
  @MinLength(3)
  @MaxLength(30)
  @ApiProperty({ required: true, example: 'ADMIN' })
  title: string

  @IsOptional()
  @IsString()
  @ToString()
  @ApiProperty({ required: false })
  description: string | null

  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
  @ApiProperty({ required: true, example: true })
  isActive: boolean

  @IsOptional()
  @IsArray()
  @ToArray({ type: RolePermissionRequestCreateDto })
  @ApiProperty({ required: true, isArray: true, type: () => RolePermissionRequestCreateDto })
  permissions?: RolePermissionRequestCreateDto[]
}
