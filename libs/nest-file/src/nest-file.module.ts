import { DynamicModule, Module } from '@nestjs/common'
import { FileService } from './services'

@Module({})
export class NestFileModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: NestFileModule,
      providers: [FileService],
      exports: [FileService],
      imports: [],
    }
  }
}
