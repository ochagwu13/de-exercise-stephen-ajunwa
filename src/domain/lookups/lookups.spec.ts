import { DataSource } from 'typeorm';
import { buildEntity } from '../../common/build-entity';
import { DOMAIN_ENTITIES } from '../../database/data-source';
import { createTestDataSource } from '../../../test/test-data-source';
import { Account } from '../account.entity';
import { Brand } from '../brand.entity';
import { Customer } from '../customer.entity';
import { TypeOrmAccountLookup } from './account-lookup';
import { TypeOrmBrandLookup } from './brand-lookup';

describe('domain schema and lookups', () => {
  let dataSource: DataSource;

  beforeEach(async () => {
    dataSource = await createTestDataSource(DOMAIN_ENTITIES);
    const lifestyle = await dataSource.getRepository(Brand).save(buildEntity(Brand, { name: 'Lifestyle Credit Card' }));
    const amara = await dataSource.getRepository(Customer).save(
      buildEntity(Customer, { customerNumber: 'C-1001', firstName: 'Amara', lastName: 'Okafor', email: 'amara.okafor@example.com' }),
    );
    await dataSource.getRepository(Account).save(
      buildEntity(Account, { accountNumber: 'A-2001', customer: amara, creditLimitMinorUnits: 500000, currency: 'GBP' }),
    );
    expect(lifestyle.id).toBeDefined();
  });

  afterEach(() => dataSource.destroy());

  it('builds the four domain tables', () => {
    const tableNames = dataSource.entityMetadatas.map((metadata) => metadata.tableName).sort();

    expect(tableNames).toEqual(['account', 'brand', 'card', 'customer']);
  });

  it('finds a brand by its exact name', async () => {
    const brands = new TypeOrmBrandLookup(dataSource);

    expect((await brands.findByName('Lifestyle Credit Card'))?.name).toBe('Lifestyle Credit Card');
    expect(await brands.findByName('lifestyle credit card ')).toBeNull();
  });

  it('finds the account for a customer number with the customer loaded', async () => {
    const accounts = new TypeOrmAccountLookup(dataSource);

    const account = await accounts.findByCustomerNumber('C-1001');

    expect(account?.accountNumber).toBe('A-2001');
    expect(account?.customer.firstName).toBe('Amara');
    expect(await accounts.findByCustomerNumber('C-9999')).toBeNull();
  });

  it('allows one account per customer', async () => {
    const amara = await dataSource.getRepository(Customer).findOneByOrFail({ customerNumber: 'C-1001' });

    await expect(
      dataSource
        .getRepository(Account)
        .save(buildEntity(Account, { accountNumber: 'A-2006', customer: amara, creditLimitMinorUnits: 2500000, currency: 'GBP' })),
    ).rejects.toThrow('UNIQUE constraint failed: account.customerId');
  });
});
