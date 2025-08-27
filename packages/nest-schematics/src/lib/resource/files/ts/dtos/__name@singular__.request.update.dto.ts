import { OmitType } from '@nestjs/swagger'
import { <%= singular(classify(name)) %>RequestCreateDto } from './<%= singular(name) %>.request.create.dto'

export class <%= singular(classify(name)) %>RequestUpdateDto extends OmitType(<%= singular(classify(name)) %>RequestCreateDto, []) {
}
