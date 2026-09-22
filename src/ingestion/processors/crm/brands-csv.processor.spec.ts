import { BrandsCsvProcessor } from './brands-csv.processor';

describe('BrandsCsvProcessor', () => {
  const processor = new BrandsCsvProcessor();

  it('matches a CRM brands csv', () => {
    expect(processor.matches({ source: 'crm', fileType: 'brands', originalFileName: 'brands.csv' })).toBe(true);
  });

  it('does not match a CRM customers csv', () => {
    expect(processor.matches({ source: 'crm', fileType: 'customers', originalFileName: 'customers.csv' })).toBe(false);
  });

  it('emits one brand per row', async () => {
    const csv = Buffer.from('Name\nLifestyle Credit Card\nCashback Rewards Card\n');

    const processed = await processor.process(csv, { source: 'crm', fileType: 'brands', originalFileName: 'brands.csv' });

    expect(processed.brands?.map((brand) => brand.name)).toEqual(['Lifestyle Credit Card', 'Cashback Rewards Card']);
  });
});
