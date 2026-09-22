import fs from 'fs';
import path from 'path';
import { DataSource } from 'typeorm';
import { Account } from '../domain/account.entity';
import { Brand } from '../domain/brand.entity';
import { Card } from '../domain/card.entity';
import { Customer } from '../domain/customer.entity';

// Every entity class must be listed here. An entity that is missing gets no table, and any
// relation pointing at it fails at start-up with "Entity metadata for X#y was not found".
export const DOMAIN_ENTITIES: Function[] = [Brand, Customer, Account, Card];

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
