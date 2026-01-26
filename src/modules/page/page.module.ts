import { Module } from '@nestjs/common'
import { PageService } from './services'

@Module({
  providers: [PageService],
  exports: [PageService],
  imports: [],
})
export class PageModule {}
