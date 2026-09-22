import { parse } from 'csv-parse/sync';

export type CsvRow = Record<string, string>;

export function parseCsvRows(buffer: Buffer): CsvRow[] {
  return parse(buffer, { columns: true, skip_empty_lines: true, bom: true });
}
