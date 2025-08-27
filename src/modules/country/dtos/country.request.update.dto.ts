import { OmitType } from '@nestjs/swagger'
import { CountryRequestCreateDto } from './country.request.create.dto'

export class CountryRequestUpdateDto extends OmitType(CountryRequestCreateDto, []) {}
