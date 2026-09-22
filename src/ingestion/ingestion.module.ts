import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DatabaseModule } from '../database/database.module';
import { DATA_SOURCE } from '../database/database.tokens';
import { DomainModule } from '../domain/domain.module';
import { IngestionService } from './ingestion.service';
import { PROCESSED_DATA_WRITER, PROCESSORS } from './ingestion.tokens';
import { PERSISTENCE_ORDER, ProcessedData } from './processed-data.type';
import { ProcessedDataWriter } from './processed-data-writer';
import { BrandsCsvProcessor } from './processors/crm/brands-csv.processor';
import { FileProcessor } from './file-processor';

@Module({
  imports: [DatabaseModule, DomainModule],
  providers: [
    {
      provide: PROCESSORS,
      useFactory: (): FileProcessor[] => [new BrandsCsvProcessor()],
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
