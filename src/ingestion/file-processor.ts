import { FileMetadata } from './file-metadata';
import { ProcessedData } from './processed-data.type';

export interface Origination {
  source: string;
  fileType: string;
}

export interface FileProcessor {
  origination: Origination;
  matches(fileMeta: FileMetadata): boolean;
  process(buffer: Buffer, fileMeta: FileMetadata): Promise<ProcessedData>;
}
