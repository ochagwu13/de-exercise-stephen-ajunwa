import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { AccountCardsQuery } from '../src/domain/queries/account-cards.query';
import { IngestionService, IngestionSummary } from '../src/ingestion/ingestion.service';
import { fixtureMetadata, readFixture } from './fixtures';

describe('ingesting the fixtures end to end', () => {
  let app: TestingModule;
  let ingestion: IngestionService;

  beforeAll(async () => {
    app = await Test.createTestingModule({ imports: [AppModule] }).compile();
    await app.init();
    ingestion = app.get(IngestionService);
  });

  afterAll(() => app.close());

  async function ingestFixture(source: string, fileType: string, name: string): Promise<IngestionSummary> {
    return ingestion.ingest(await readFixture(name), fixtureMetadata(source, fileType, name));
  }

  it('loads brands, customers, accounts and cards', async () => {
    expect((await ingestFixture('crm', 'brands', 'brands.csv')).written).toEqual({ brands: 3 });
    expect((await ingestFixture('crm', 'customers', 'customers.csv')).written).toEqual({ customers: 5, accounts: 6 });
    expect((await ingestFixture('card-ops', 'cards', 'cards.csv')).written).toEqual({ cards: 8 });

    const accountCards = app.get(AccountCardsQuery);
    expect(await accountCards.cardsOnAccount('A-2001')).toEqual([
      { cardNumber: '4111111111110001', brandName: 'Lifestyle Credit Card' },
      { cardNumber: '4111111111110002', brandName: 'Cashback Rewards Card' },
    ]);
    expect(await accountCards.brandNames()).toHaveLength(3);
  });
});
