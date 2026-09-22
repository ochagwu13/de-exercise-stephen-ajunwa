import { parseIngestArguments } from './ingest-arguments';

describe('parseIngestArguments', () => {
  it('reads source, type and the file path', () => {
    const parsed = parseIngestArguments(['--source', 'crm', '--type', 'customers', 'fixtures/customers.csv']);

    expect(parsed).toEqual({ source: 'crm', fileType: 'customers', filePath: 'fixtures/customers.csv' });
  });

  it('accepts the flags in any order', () => {
    const parsed = parseIngestArguments(['fixtures/cards.csv', '--type', 'cards', '--source', 'card-ops']);

    expect(parsed).toEqual({ source: 'card-ops', fileType: 'cards', filePath: 'fixtures/cards.csv' });
  });

  it.each([
    [['--type', 'cards', 'fixtures/cards.csv'], '--source is required'],
    [['--source', 'crm', 'fixtures/cards.csv'], '--type is required'],
    [['--source', 'crm', '--type', 'cards'], 'a file path is required'],
    [['--source', 'crm', '--type', 'cards', 'a.csv', 'b.csv'], 'exactly one file path is expected'],
    [['--source', 'crm', '--type', 'cards', '--bogus', 'x', 'a.csv'], 'unknown flag --bogus'],
  ])('rejects %j with "%s"', (argv, message) => {
    expect(() => parseIngestArguments(argv)).toThrow(message);
  });
});
