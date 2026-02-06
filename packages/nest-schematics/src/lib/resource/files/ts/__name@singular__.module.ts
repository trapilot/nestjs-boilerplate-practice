import { Module } from '@nestjs/common'
import { <%= singular(classify(name)) %>Service } from './services/<%= singular(lowercased(name)) %>.service'

@Module({
  providers: [<%= singular(classify(name)) %>Service],
  exports: [<%= singular(classify(name)) %>Service],
  imports: [],
})
export class <%= singular(classify(name)) %>Module {}
