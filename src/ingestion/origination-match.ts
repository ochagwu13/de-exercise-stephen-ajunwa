import { FileMetadata } from './file-metadata';
import { Origination } from './file-processor';

export function matchesOrigination(
  fileMeta: FileMetadata,
  origination: Origination,
  fileNamePattern: RegExp,
): boolean {
  return (
    fileMeta.source.toLowerCase() === origination.source.toLowerCase() &&
    fileMeta.fileType.toLowerCase() === origination.fileType.toLowerCase() &&
    fileNamePattern.test(fileMeta.originalFileName)
  );
}
