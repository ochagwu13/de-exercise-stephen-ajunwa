import { DataSource } from 'typeorm';
import { Brand } from '../brand.entity';

export interface BrandLookup {
  findByName(name: string): Promise<Brand | null>;
}

export const BRAND_LOOKUP = Symbol('BRAND_LOOKUP');

export class TypeOrmBrandLookup implements BrandLookup {
  constructor(private readonly dataSource: DataSource) {}

  findByName(name: string): Promise<Brand | null> {
    return this.dataSource.getRepository(Brand).findOneBy({ name });
  }
}
