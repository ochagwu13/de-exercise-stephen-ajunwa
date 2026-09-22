const MONETARY_AMOUNT = /^(-?)(\d+)(?:\.(\d{1,2}))?$/;

export function toMinorUnits(amount: string): number {
  const match = MONETARY_AMOUNT.exec(amount.trim());
  if (!match) {
    throw new Error(`not a monetary amount: "${amount}"`);
  }
  const [, sign, wholeUnits, fractionDigits = ''] = match;
  const minorUnits = Number(wholeUnits) * 100 + Number(fractionDigits.padEnd(2, '0'));
  return sign === '-' ? -minorUnits : minorUnits;
}
