import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DatabaseModule } from '../database/database.module';
import { DATA_SOURCE } from '../database/database.tokens';
import { ACCOUNT_LOOKUP, TypeOrmAccountLookup } from './lookups/account-lookup';
import { BRAND_LOOKUP, TypeOrmBrandLookup } from './lookups/brand-lookup';
import { AccountCardsQuery } from './queries/account-cards.query';

@Module({
  imports: [DatabaseModule],
  providers: [
    { provide: BRAND_LOOKUP, useFactory: (dataSource: DataSource) => new TypeOrmBrandLookup(dataSource), inject: [DATA_SOURCE] },
    { provide: ACCOUNT_LOOKUP, useFactory: (dataSource: DataSource) => new TypeOrmAccountLookup(dataSource), inject: [DATA_SOURCE] },
    { provide: AccountCardsQuery, useFactory: (dataSource: DataSource) => new AccountCardsQuery(dataSource), inject: [DATA_SOURCE] },
  ],
  exports: [BRAND_LOOKUP, ACCOUNT_LOOKUP, AccountCardsQuery],
})
export class DomainModule {}
