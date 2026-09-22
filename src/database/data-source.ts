import fs from 'fs';
import path from 'path';
import { DataSource } from 'typeorm';

export const DOMAIN_ENTITIES: Function[] = [];

export const DEV_DATABASE_PATH = path.resolve(__dirname, '../../data/exercise.sqlite');

export interface DataSourceSettings {
  inMemory: boolean;
  entities?: Function[];
}

export function buildDataSource(settings: DataSourceSettings): DataSource {
  if (!settings.inMemory) {
    fs.mkdirSync(path.dirname(DEV_DATABASE_PATH), { recursive: true });
  }
  return new DataSource({
    type: 'better-sqlite3',
    database: settings.inMemory ? ':memory:' : DEV_DATABASE_PATH,
    entities: settings.entities ?? DOMAIN_ENTITIES,
    synchronize: true,
  });
}
