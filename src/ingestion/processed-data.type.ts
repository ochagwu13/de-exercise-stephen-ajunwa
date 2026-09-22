import { PersistenceStep } from './processed-data-writer';

export interface ProcessedData {
  errors?: string[];
}

export const PERSISTENCE_ORDER: PersistenceStep<ProcessedData>[] = [];
