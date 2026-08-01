import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { AiModule } from '../ai/ai.module';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [AiModule, CompaniesModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
