import { Module } from '@nestjs/common'
import { MediaService } from './services'

@Module({
  providers: [MediaService],
  exports: [MediaService],
  imports: [],
})
export class MediaModule {}
