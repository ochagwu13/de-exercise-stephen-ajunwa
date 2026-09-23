import { DataSource } from 'typeorm';
import { Brand } from '../brand.entity';

export interface BrandLookup {
  findByName(name: string): Promise<Brand | null>;
}

export const BRAND_LOOKUP = Symbol('BRAND_LOOKUP');

export class TypeOrmBrandLookup implements BrandLookup {
  constructor(private readonly dataSource: DataSource) {}

  async findByName(name: string): Promise<Brand | null> {
    const normalizedName = name.trim().toLowerCase();
    const brands = await this.dataSource.getRepository(Brand).find();

    return brands.find((brand) => brand.name.trim().toLowerCase() === normalizedName) ?? null;
  }
}
