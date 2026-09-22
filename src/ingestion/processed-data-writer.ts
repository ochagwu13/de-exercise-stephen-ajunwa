import { DataSource, EntityManager } from 'typeorm';
import { errorMessage } from '../common/error-message';
import { IngestionWriteError } from './ingestion.errors';

export interface PersistenceStep<TData> {
  key: Exclude<keyof TData, 'errors'> & string;
  entity: Function;
}

export type WrittenCounts = Record<string, number>;

export class ProcessedDataWriter<TData extends object> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly steps: PersistenceStep<TData>[],
  ) {}

  async write(processed: TData): Promise<WrittenCounts> {
    const written: WrittenCounts = {};
    await this.dataSource.transaction(async (manager) => {
      for (const step of this.steps) {
        const rows = processed[step.key];
        if (!Array.isArray(rows)) {
          continue;
        }
        await this.writeRows(manager, step, rows);
        written[step.key] = rows.length;
      }
    });
    return written;
  }

  private async writeRows(manager: EntityManager, step: PersistenceStep<TData>, rows: object[]): Promise<void> {
    const repository = manager.getRepository(step.entity);
    for (const [index, row] of rows.entries()) {
      try {
        await repository.save(row);
      } catch (cause) {
        throw new IngestionWriteError(`${step.key} row ${index + 1}: ${errorMessage(cause)}`, cause);
      }
    }
  }
}
