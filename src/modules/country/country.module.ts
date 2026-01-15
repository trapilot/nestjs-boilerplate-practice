import { Module } from '@nestjs/common'
import { CountryService } from './services'

@Module({
  providers: [CountryService],
  exports: [CountryService],
  imports: [],
})
export class CountryModule {}
