import { Account } from '../domain/account.entity';
import { Brand } from '../domain/brand.entity';
import { Card } from '../domain/card.entity';
import { Customer } from '../domain/customer.entity';
import { PersistenceStep } from './processed-data-writer';

export interface ProcessedData {
  errors?: string[];
  brands?: Brand[];
  customers?: Customer[];
  accounts?: Account[];
  cards?: Card[];
}

export const PERSISTENCE_ORDER: PersistenceStep<ProcessedData>[] = [
  { key: 'brands', entity: Brand },
  { key: 'customers', entity: Customer },
  { key: 'accounts', entity: Account },
  { key: 'cards', entity: Card },
];
