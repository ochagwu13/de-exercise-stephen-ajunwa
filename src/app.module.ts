import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { IngestionModule } from './ingestion/ingestion.module';

@Module({
  imports: [DatabaseModule, IngestionModule],
})
export class AppModule {}
