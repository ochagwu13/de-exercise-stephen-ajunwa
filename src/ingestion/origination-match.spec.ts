import { matchesOrigination } from './origination-match';

describe('matchesOrigination', () => {
  const origination = { source: 'crm', fileType: 'customers' };
  const pattern = /^customers.*\.csv$/i;

  it('matches when source, type and file name all agree', () => {
    const fileMeta = { source: 'crm', fileType: 'customers', originalFileName: 'customers-2026-09.csv' };

    expect(matchesOrigination(fileMeta, origination, pattern)).toBe(true);
  });

  it('ignores case on source and type', () => {
    const fileMeta = { source: 'CRM', fileType: 'Customers', originalFileName: 'Customers.CSV' };

    expect(matchesOrigination(fileMeta, origination, pattern)).toBe(true);
  });

  it('rejects a different file type', () => {
    const fileMeta = { source: 'crm', fileType: 'cards', originalFileName: 'customers.csv' };

    expect(matchesOrigination(fileMeta, origination, pattern)).toBe(false);
  });

  it('rejects a file name that does not match the pattern', () => {
    const fileMeta = { source: 'crm', fileType: 'customers', originalFileName: 'old-customers.csv' };

    expect(matchesOrigination(fileMeta, origination, pattern)).toBe(false);
  });
});
