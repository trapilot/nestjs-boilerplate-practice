import { OmitType } from '@nestjs/swagger'
import { AppVersionRequestCreateDto } from './app-version.request.create.dto'

export class AppVersionRequestUpdateDto extends OmitType(AppVersionRequestCreateDto, ['type']) {}
