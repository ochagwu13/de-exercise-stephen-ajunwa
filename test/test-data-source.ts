import { DataSource } from 'typeorm';
import { buildDataSource } from '../src/database/data-source';

export async function createTestDataSource(entities: Function[]): Promise<DataSource> {
  const dataSource = buildDataSource({ inMemory: true, entities });
  return dataSource.initialize();
}
