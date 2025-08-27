import { OmitType } from '@nestjs/swagger'
import { DistrictRequestCreateDto } from './district.request.create.dto'

export class DistrictRequestUpdateDto extends OmitType(DistrictRequestCreateDto, []) {}
