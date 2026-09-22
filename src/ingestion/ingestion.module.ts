import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DatabaseModule } from '../database/database.module';
import { DATA_SOURCE } from '../database/database.tokens';
import { DomainModule } from '../domain/domain.module';
import { ACCOUNT_LOOKUP, AccountLookup } from '../domain/lookups/account-lookup';
import { BRAND_LOOKUP, BrandLookup } from '../domain/lookups/brand-lookup';
import { IngestionService } from './ingestion.service';
import { PROCESSED_DATA_WRITER, PROCESSORS } from './ingestion.tokens';
import { PERSISTENCE_ORDER, ProcessedData } from './processed-data.type';
import { ProcessedDataWriter } from './processed-data-writer';
import { CardsCsvProcessor } from './processors/card-ops/cards-csv.processor';
import { BrandsCsvProcessor } from './processors/crm/brands-csv.processor';
import { CustomersCsvProcessor } from './processors/crm/customers-csv.processor';
import { FileProcessor } from './file-processor';

@Module({
  imports: [DatabaseModule, DomainModule],
  providers: [
    {
      provide: PROCESSORS,
      useFactory: (brands: BrandLookup, accounts: AccountLookup): FileProcessor[] => [
        new BrandsCsvProcessor(),
        new CustomersCsvProcessor(),
        new CardsCsvProcessor(brands, accounts),
      ],
      inject: [BRAND_LOOKUP, ACCOUNT_LOOKUP],
    },
    {
      provide: PROCESSED_DATA_WRITER,
      useFactory: (dataSource: DataSource) => new ProcessedDataWriter<ProcessedData>(dataSource, PERSISTENCE_ORDER),
      inject: [DATA_SOURCE],
    },
    IngestionService,
  ],
  exports: [IngestionService],
})
export class IngestionModule {}
