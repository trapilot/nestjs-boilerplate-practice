import { Module } from '@nestjs/common'
import { FactService } from './services'

@Module({
  providers: [FactService],
  exports: [FactService],
  imports: [],
})
export class FactModule {}
