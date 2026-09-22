import { parseCsvRows } from './csv';

describe('parseCsvRows', () => {
  it('returns one object per data row keyed by the header', () => {
    const csv = Buffer.from('Name,City\nWaitrose,London\nApple Store,Leeds\n');

    expect(parseCsvRows(csv)).toEqual([
      { Name: 'Waitrose', City: 'London' },
      { Name: 'Apple Store', City: 'Leeds' },
    ]);
  });

  it('preserves surrounding whitespace and case in values', () => {
    const csv = Buffer.from('Brand\nlifestyle credit card \n"  BLACK BUSINESS"\n');

    expect(parseCsvRows(csv)).toEqual([
      { Brand: 'lifestyle credit card ' },
      { Brand: '  BLACK BUSINESS' },
    ]);
  });

  it('skips empty lines and strips a byte order mark', () => {
    const csv = Buffer.from('﻿Name\nA\n\nB\n');

    expect(parseCsvRows(csv)).toEqual([{ Name: 'A' }, { Name: 'B' }]);
  });
});
