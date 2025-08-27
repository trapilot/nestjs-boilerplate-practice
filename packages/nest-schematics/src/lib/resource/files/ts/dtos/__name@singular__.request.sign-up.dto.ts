import { OmitType } from '@nestjs/swagger'
import { <%= singular(classify(name)) %>RequestCreateDto } from './<%= singular(name) %>.request.create.dto'

export class <%= singular(classify(name)) %>RequestSignUpDto extends OmitType(<%= singular(classify(name)) %>RequestCreateDto, [] as const) {}
