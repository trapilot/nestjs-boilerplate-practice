import { DynamicModule, Module } from '@nestjs/common'

@Module({})
export class SharedModule {
  static register(): DynamicModule {
    return {
      global: true,
      module: SharedModule,
      providers: [],
      imports: [],
      exports: [],
    }
  }
}
