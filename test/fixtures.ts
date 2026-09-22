import fs from 'fs/promises';
import path from 'path';
import { FileMetadata } from '../src/ingestion/file-metadata';

export function readFixture(name: string): Promise<Buffer> {
  return fs.readFile(path.resolve(__dirname, '../fixtures', name));
}

export function fixtureMetadata(source: string, fileType: string, name: string): FileMetadata {
  return { source, fileType, originalFileName: name };
}
