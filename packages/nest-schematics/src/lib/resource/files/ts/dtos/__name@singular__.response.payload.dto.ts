import { PickType } from '@nestjs/swagger'
import { <%= singular(classify(name)) %>ResponseDetailDto } from './<%= singular(name) %>.response.detail.dto'

export class <%= singular(classify(name)) %>ResponsePayloadDto extends PickType(<%= singular(classify(name)) %>ResponseDetailDto, [
  'id',
] as const) {}
