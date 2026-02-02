import { Module } from '@nestjs/common'
import { MediaService } from './services/media.service'

@Module({
  providers: [MediaService],
  exports: [MediaService],
  imports: [],
})
export class MediaModule {}
