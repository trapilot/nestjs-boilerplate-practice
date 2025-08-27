import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { <%= singular(uppercased(name)) %>_DOC_OPERATION } from '../constants'
import { <%= singular(classify(name)) %>Service } from '../services'

@ApiTags(<%= singular(uppercased(name)) %>_DOC_OPERATION)
@Controller({ version: '1', path: '/<%= plural(name) %>' })
export class <%= singular(classify(name)) %>AppController {
  constructor(protected readonly <%= singular(lowercased(name)) %>Service: <%= singular(classify(name)) %>Service) {}
}
