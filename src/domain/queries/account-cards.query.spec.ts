import { DataSource } from 'typeorm';
import { buildEntity } from '../../common/build-entity';
import { DOMAIN_ENTITIES } from '../../database/data-source';
import { createTestDataSource } from '../../../test/test-data-source';
import { Account } from '../account.entity';
import { Brand } from '../brand.entity';
import { Card } from '../card.entity';
import { Customer } from '../customer.entity';
import { AccountCardsQuery } from './account-cards.query';

describe('AccountCardsQuery', () => {
  let dataSource: DataSource;
  let query: AccountCardsQuery;

  beforeEach(async () => {
    dataSource = await createTestDataSource(DOMAIN_ENTITIES);
    query = new AccountCardsQuery(dataSource);
    const [lifestyle, cashback] = await dataSource
      .getRepository(Brand)
      .save([buildEntity(Brand, { name: 'Lifestyle Credit Card' }), buildEntity(Brand, { name: 'Cashback Rewards Card' })]);
    const amara = await dataSource.getRepository(Customer).save(
      buildEntity(Customer, { customerNumber: 'C-1001', firstName: 'Amara', lastName: 'Okafor', email: 'a@example.com' }),
    );
    const account = await dataSource.getRepository(Account).save(
      buildEntity(Account, { accountNumber: 'A-2001', customer: amara, creditLimitMinorUnits: 500000, currency: 'GBP' }),
    );
    await dataSource.getRepository(Card).save([
      buildEntity(Card, { cardNumber: '4111111111110002', expiryMonth: 1, expiryYear: 2028, brand: cashback, account }),
      buildEntity(Card, { cardNumber: '4111111111110001', expiryMonth: 8, expiryYear: 2027, brand: lifestyle, account }),
    ]);
  });

  afterEach(() => dataSource.destroy());

  it('lists the cards on an account with their brand, ordered by card number', async () => {
    expect(await query.cardsOnAccount('A-2001')).toEqual([
      { cardNumber: '4111111111110001', brandName: 'Lifestyle Credit Card' },
      { cardNumber: '4111111111110002', brandName: 'Cashback Rewards Card' },
    ]);
  });

  it('returns an empty list for an unknown account', async () => {
    expect(await query.cardsOnAccount('A-0000')).toEqual([]);
  });

  it('lists brand names alphabetically', async () => {
    expect(await query.brandNames()).toEqual(['Cashback Rewards Card', 'Lifestyle Credit Card']);
  });
});
