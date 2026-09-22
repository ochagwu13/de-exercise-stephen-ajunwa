import { DataSource } from 'typeorm';
import { Account } from '../account.entity';

export interface AccountLookup {
  findByCustomerNumber(customerNumber: string): Promise<Account | null>;
}

export const ACCOUNT_LOOKUP = Symbol('ACCOUNT_LOOKUP');

export class TypeOrmAccountLookup implements AccountLookup {
  constructor(private readonly dataSource: DataSource) {}

  findByCustomerNumber(customerNumber: string): Promise<Account | null> {
    return this.dataSource.getRepository(Account).findOne({
      where: { customer: { customerNumber } },
      relations: { customer: true },
    });
  }
}
