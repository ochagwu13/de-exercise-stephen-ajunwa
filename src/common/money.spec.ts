import { toMinorUnits } from './money';

describe('toMinorUnits', () => {
  it.each([
    ['5000.00', 500000],
    ['42.50', 4250],
    ['18.20', 1820],
    ['9.99', 999],
    ['7', 700],
    ['0.5', 50],
    ['-12.34', -1234],
  ])('converts %s to %d minor units', (amount, expectedMinorUnits) => {
    expect(toMinorUnits(amount)).toBe(expectedMinorUnits);
  });

  it('rejects amounts with more than two decimal places', () => {
    expect(() => toMinorUnits('1.234')).toThrow('not a monetary amount: "1.234"');
  });

  it('rejects non-numeric input', () => {
    expect(() => toMinorUnits('ten')).toThrow('not a monetary amount: "ten"');
  });
});
