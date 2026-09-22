import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import fs from 'fs/promises';
import path from 'path';
import { AppModule } from '../app.module';
import { errorMessage } from '../common/error-message';
import { IngestionService } from '../ingestion/ingestion.service';
import { parseIngestArguments } from './ingest-arguments';

async function main(): Promise<void> {
  const ingestArguments = parseIngestArguments(process.argv.slice(2));
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  try {
    const ingestion = app.get(IngestionService);
    const summary = await ingestion.ingest(await fs.readFile(ingestArguments.filePath), {
      originalFileName: path.basename(ingestArguments.filePath),
      source: ingestArguments.source,
      fileType: ingestArguments.fileType,
    });
    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await app.close();
  }
}

main().catch((cause: unknown) => {
  console.error(errorMessage(cause));
  process.exit(1);
});
