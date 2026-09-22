import { buildEntity } from '../../../common/build-entity';
import { CsvRow, parseCsvRows } from '../../../common/csv';
import { Card } from '../../../domain/card.entity';
import { AccountLookup } from '../../../domain/lookups/account-lookup';
import { BrandLookup } from '../../../domain/lookups/brand-lookup';
import { FileMetadata } from '../../file-metadata';
import { FileProcessor, Origination } from '../../file-processor';
import { matchesOrigination } from '../../origination-match';
import { ProcessedData } from '../../processed-data.type';

function parseExpiry(expiryDate: string): { expiryYear: number; expiryMonth: number } {
  const [expiryYear, expiryMonth] = expiryDate.split('-').map(Number);
  return { expiryYear, expiryMonth };
}

export class CardsCsvProcessor implements FileProcessor {
  origination: Origination = { source: 'card-ops', fileType: 'cards' };

  constructor(
    private readonly brands: BrandLookup,
    private readonly accounts: AccountLookup,
  ) {}

  matches(fileMeta: FileMetadata): boolean {
    return matchesOrigination(fileMeta, this.origination, /^cards.*\.csv$/i);
  }

  async process(buffer: Buffer, fileMeta: FileMetadata): Promise<ProcessedData> {
    const cards: Card[] = [];
    const errors: string[] = [];

    for (const [index, row] of parseCsvRows(buffer).entries()) {
      const card = await this.buildCard(row, index + 1, errors);
      if (card) {
        cards.push(card);
      }
    }

    return { cards, errors };
  }

  private async buildCard(row: CsvRow, rowNumber: number, errors: string[]): Promise<Card | null> {
    const account = await this.accounts.findByCustomerNumber(row.CustomerNumber);
    if (!account) {
      errors.push(`row ${rowNumber}: unknown customer ${row.CustomerNumber}`);
      return null;
    }
    const brand = await this.brands.findByName(row.Brand);
    if (!brand) {
      errors.push(`row ${rowNumber}: unknown brand "${row.Brand}"`);
      return null;
    }
    return buildEntity(Card, { cardNumber: row.CardNumber, ...parseExpiry(row.ExpiryDate), brand, account });
  }
}
