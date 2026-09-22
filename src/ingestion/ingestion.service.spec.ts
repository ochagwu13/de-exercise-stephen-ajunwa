import { FileMetadata } from './file-metadata';
import { FileProcessor } from './file-processor';
import { ProcessedData } from './processed-data.type';
import { IngestionService, ProcessedDataWriterLike } from './ingestion.service';

class BrandsProcessor implements FileProcessor {
  origination = { source: 'crm', fileType: 'brands' };
  matches(fileMeta: FileMetadata): boolean {
    return fileMeta.fileType === 'brands';
  }
  async process(): Promise<ProcessedData> {
    return {};
  }
}

class RejectingBrandsProcessor extends BrandsProcessor {
  async process(): Promise<ProcessedData> {
    return { errors: ['row 2: unknown brand "x"', 'row 5: unknown brand "y"'] };
  }
}

describe('IngestionService', () => {
  const brandsFile: FileMetadata = { source: 'crm', fileType: 'brands', originalFileName: 'brands.csv' };
  let writer: jest.Mocked<ProcessedDataWriterLike>;

  beforeEach(() => {
    writer = { write: jest.fn().mockResolvedValue({ brands: 3 }) };
  });

  it('routes the file to the one matching processor and reports what was written', async () => {
    const service = new IngestionService([new BrandsProcessor()], writer);

    const summary = await service.ingest(Buffer.from(''), brandsFile);

    expect(summary).toEqual({ processor: 'BrandsProcessor', written: { brands: 3 } });
    expect(writer.write).toHaveBeenCalledWith({});
  });

  it('fails when no processor matches', async () => {
    const service = new IngestionService([new BrandsProcessor()], writer);
    const cardsFile: FileMetadata = { source: 'card-ops', fileType: 'cards', originalFileName: 'cards.csv' };

    await expect(service.ingest(Buffer.from(''), cardsFile)).rejects.toThrow(
      'no processor matches card-ops/cards "cards.csv"',
    );
    expect(writer.write).not.toHaveBeenCalled();
  });

  it('fails when more than one processor matches', async () => {
    const service = new IngestionService([new BrandsProcessor(), new BrandsProcessor()], writer);

    await expect(service.ingest(Buffer.from(''), brandsFile)).rejects.toThrow(
      '2 processors match crm/brands "brands.csv": BrandsProcessor, BrandsProcessor',
    );
  });

  it('rejects the whole file when the processor reports errors and writes nothing', async () => {
    const service = new IngestionService([new RejectingBrandsProcessor()], writer);

    await expect(service.ingest(Buffer.from(''), brandsFile)).rejects.toThrow(
      'RejectingBrandsProcessor rejected "brands.csv": row 2: unknown brand "x"; row 5: unknown brand "y"',
    );
    expect(writer.write).not.toHaveBeenCalled();
  });
});
