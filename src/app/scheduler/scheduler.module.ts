import { DynamicModule, Module } from '@nestjs/common'
import { IModuleImport, IModuleSchedulerOptions } from 'lib/nest-core'
import { QueueModule } from './queues'
import { TaskModule } from './tasks'

@Module({})
export class SchedulerModule {
  static register(options: IModuleSchedulerOptions): DynamicModule {
    const imports: IModuleImport[] = []

    if (options?.queue) {
      imports.push(QueueModule)
    }
    if (options?.task) {
      imports.push(TaskModule)
    }

    return {
      module: SchedulerModule,
      imports,
    }
  }
}
