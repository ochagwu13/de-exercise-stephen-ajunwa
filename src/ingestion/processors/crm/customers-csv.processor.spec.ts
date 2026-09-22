import { fixtureMetadata, readFixture } from '../../../../test/fixtures';
import { CustomersCsvProcessor } from './customers-csv.processor';

describe('CustomersCsvProcessor', () => {
  const processor = new CustomersCsvProcessor();
  const customersFile = fixtureMetadata('crm', 'customers', 'customers.csv');

  it('matches a CRM customers csv', () => {
    expect(processor.matches(customersFile)).toBe(true);
  });

  it('does not match a card-ops file', () => {
    expect(processor.matches(fixtureMetadata('card-ops', 'cards', 'cards.csv'))).toBe(false);
  });

  it('emits one customer and one account per row, linked', async () => {
    const csv = Buffer.from(
      'CustomerNumber,FirstName,LastName,Email,AccountNumber,CreditLimit,Currency\n' +
        'C-1001,Amara,Okafor,amara.okafor@example.com,A-2001,5000.00,GBP\n' +
        'C-1004,Dev,Patel,dev.patel@example.com,A-2004,4000.00,EUR\n',
    );

    const processed = await processor.process(csv, customersFile);

    expect(processed.customers?.map((customer) => customer.customerNumber)).toEqual(['C-1001', 'C-1004']);
    expect(processed.accounts?.map((account) => account.accountNumber)).toEqual(['A-2001', 'A-2004']);
    expect(processed.accounts?.[0].creditLimitMinorUnits).toBe(500000);
    expect(processed.accounts?.[1].currency).toBe('EUR');
    expect(processed.accounts?.[0].customer).toBe(processed.customers?.[0]);
  });

  it('ingests every account in the CRM fixture', async () => {
    const processed = await processor.process(await readFixture('customers.csv'), customersFile);

    expect(processed.customers).toHaveLength(5);
    expect(processed.accounts).toHaveLength(6);
  });
});
