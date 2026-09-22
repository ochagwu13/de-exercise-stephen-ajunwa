import { buildEntity } from '../../../common/build-entity';
import { parseCsvRows } from '../../../common/csv';
import { Brand } from '../../../domain/brand.entity';
import { FileMetadata } from '../../file-metadata';
import { FileProcessor, Origination } from '../../file-processor';
import { matchesOrigination } from '../../origination-match';
import { ProcessedData } from '../../processed-data.type';

export class BrandsCsvProcessor implements FileProcessor {
  origination: Origination = { source: 'crm', fileType: 'brands' };

  matches(fileMeta: FileMetadata): boolean {
    return matchesOrigination(fileMeta, this.origination, /^brands.*\.csv$/i);
  }

  async process(buffer: Buffer, fileMeta: FileMetadata): Promise<ProcessedData> {
    const brands = parseCsvRows(buffer).map((row) => buildEntity(Brand, { name: row.Name }));
    return { brands };
  }
}
