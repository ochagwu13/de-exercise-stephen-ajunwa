import { buildEntity } from '../../../common/build-entity';
import { Account } from '../../../domain/account.entity';
import { Brand } from '../../../domain/brand.entity';
import { Customer } from '../../../domain/customer.entity';
import { AccountLookup } from '../../../domain/lookups/account-lookup';
import { BrandLookup } from '../../../domain/lookups/brand-lookup';
import { fixtureMetadata, readFixture } from '../../../../test/fixtures';
import { CardsCsvProcessor } from './cards-csv.processor';

function inMemoryBrandLookup(brandNames: string[]): BrandLookup {
  const brands = brandNames.map((name) => buildEntity(Brand, { name }));
  const normalise = (name: string): string => name.trim().toLowerCase();
  return {
    findByName: async (name) => brands.find((brand) => normalise(brand.name) === normalise(name)) ?? null,
  };
}

function inMemoryAccountLookup(customerToAccount: Record<string, string>): AccountLookup {
  const accountsByCustomerNumber = new Map(
    Object.entries(customerToAccount).map(([customerNumber, accountNumber]) => [
      customerNumber,
      buildEntity(Account, { accountNumber, customer: buildEntity(Customer, { customerNumber }) }),
    ]),
  );
  return { findByCustomerNumber: async (customerNumber) => accountsByCustomerNumber.get(customerNumber) ?? null };
}

describe('CardsCsvProcessor', () => {
  const cardsFile = fixtureMetadata('card-ops', 'cards', 'cards.csv');
  const brands = inMemoryBrandLookup(['Lifestyle Credit Card', 'Black Business Credit Card', 'Cashback Rewards Card']);
  const accounts = inMemoryAccountLookup({
    'C-1001': 'A-2001',
    'C-1002': 'A-2002',
    'C-1003': 'A-2003',
    'C-1004': 'A-2004',
    'C-1005': 'A-2005',
  });
  const processor = new CardsCsvProcessor(brands, accounts);

  it('matches a card-ops cards csv', () => {
    expect(processor.matches(cardsFile)).toBe(true);
  });

  it('does not match a CRM file', () => {
    expect(processor.matches(fixtureMetadata('crm', 'customers', 'customers.csv'))).toBe(false);
  });

  it('builds one card per row of the card-ops fixture', async () => {
    const processed = await processor.process(await readFixture('cards.csv'), cardsFile);

    expect(processed.errors).toEqual([]);
    expect(processed.cards).toHaveLength(8);
    expect(processed.cards?.[0]).toMatchObject({
      cardNumber: '4111111111110001',
      expiryMonth: 8,
      expiryYear: 2027,
      brand: { name: 'Lifestyle Credit Card' },
      account: { accountNumber: 'A-2001' },
    });
    expect(processed.cards?.map((card) => card.brand.name)).toEqual([
      'Lifestyle Credit Card',
      'Cashback Rewards Card',
      'Lifestyle Credit Card',
      'Lifestyle Credit Card',
      'Black Business Credit Card',
      'Cashback Rewards Card',
      'Black Business Credit Card',
      'Cashback Rewards Card',
    ]);
  });

  it('reports rows whose customer is unknown', async () => {
    const csv = Buffer.from(
      'CardNumber,ExpiryDate,Brand,CustomerNumber,AccountNumber\n4111111111110099,2027-01,Lifestyle Credit Card,C-9999,A-9999\n',
    );

    const processed = await processor.process(csv, cardsFile);

    expect(processed.cards).toEqual([]);
    expect(processed.errors).toEqual(['row 1: unknown customer C-9999']);
  });
});
