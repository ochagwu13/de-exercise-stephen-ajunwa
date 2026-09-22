import { Inject, Injectable } from '@nestjs/common';
import { FileMetadata } from './file-metadata';
import { FileProcessor } from './file-processor';
import { AmbiguousProcessorError, FileRejectedError, NoMatchingProcessorError } from './ingestion.errors';
import { PROCESSED_DATA_WRITER, PROCESSORS } from './ingestion.tokens';
import { ProcessedData } from './processed-data.type';
import { ProcessedDataWriter, WrittenCounts } from './processed-data-writer';

export interface IngestionSummary {
  processor: string;
  written: WrittenCounts;
}

export type ProcessedDataWriterLike = Pick<ProcessedDataWriter<ProcessedData>, 'write'>;

function describeFile(fileMeta: FileMetadata): string {
  return `${fileMeta.source}/${fileMeta.fileType} "${fileMeta.originalFileName}"`;
}

@Injectable()
export class IngestionService {
  constructor(
    @Inject(PROCESSORS) private readonly processors: FileProcessor[],
    @Inject(PROCESSED_DATA_WRITER) private readonly writer: ProcessedDataWriterLike,
  ) {}

  async ingest(buffer: Buffer, fileMeta: FileMetadata): Promise<IngestionSummary> {
    const processor = this.selectProcessor(fileMeta);
    const processorName = processor.constructor.name;
    const processed = await processor.process(buffer, fileMeta);
    if (processed.errors && processed.errors.length > 0) {
      throw new FileRejectedError(
        `${processorName} rejected "${fileMeta.originalFileName}": ${processed.errors.join('; ')}`,
      );
    }
    const written = await this.writer.write(processed);
    return { processor: processorName, written };
  }

  private selectProcessor(fileMeta: FileMetadata): FileProcessor {
    const matchingProcessors = this.processors.filter((processor) => processor.matches(fileMeta));
    if (matchingProcessors.length === 0) {
      throw new NoMatchingProcessorError(`no processor matches ${describeFile(fileMeta)}`);
    }
    if (matchingProcessors.length > 1) {
      const names = matchingProcessors.map((processor) => processor.constructor.name).join(', ');
      throw new AmbiguousProcessorError(
        `${matchingProcessors.length} processors match ${describeFile(fileMeta)}: ${names}`,
      );
    }
    return matchingProcessors[0];
  }
}
