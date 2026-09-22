export interface IngestArguments {
  source: string;
  fileType: string;
  filePath: string;
}

const FLAG_NAMES: Record<string, keyof Pick<IngestArguments, 'source' | 'fileType'>> = {
  '--source': 'source',
  '--type': 'fileType',
};

export function parseIngestArguments(argv: string[]): IngestArguments {
  const flags: Partial<Pick<IngestArguments, 'source' | 'fileType'>> = {};
  const filePaths: string[] = [];

  for (let position = 0; position < argv.length; position += 1) {
    const argument = argv[position];
    if (argument.startsWith('--')) {
      const flagName = FLAG_NAMES[argument];
      if (!flagName) {
        throw new Error(`unknown flag ${argument}`);
      }
      flags[flagName] = argv[position + 1];
      position += 1;
    } else {
      filePaths.push(argument);
    }
  }

  if (!flags.source) throw new Error('--source is required');
  if (!flags.fileType) throw new Error('--type is required');
  if (filePaths.length === 0) throw new Error('a file path is required');
  if (filePaths.length > 1) throw new Error('exactly one file path is expected');

  return { source: flags.source, fileType: flags.fileType, filePath: filePaths[0] };
}
