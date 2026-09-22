export class FileRejectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileRejectedError';
  }
}

export class NoMatchingProcessorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NoMatchingProcessorError';
  }
}

export class AmbiguousProcessorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AmbiguousProcessorError';
  }
}

export class IngestionWriteError extends Error {
  constructor(message: string, cause: unknown) {
    super(message, { cause });
    this.name = 'IngestionWriteError';
  }
}
