import { DataSource } from 'typeorm';
import { Brand } from '../brand.entity';
import { Card } from '../card.entity';

export interface AccountCardSummary {
  cardNumber: string;
  brandName: string;
}

export class AccountCardsQuery {
  constructor(private readonly dataSource: DataSource) {}

  async cardsOnAccount(accountNumber: string): Promise<AccountCardSummary[]> {
    const cards = await this.dataSource.getRepository(Card).find({
      where: { account: { accountNumber } },
      relations: { brand: true },
      order: { cardNumber: 'ASC' },
    });
    return cards.map((card) => ({ cardNumber: card.cardNumber, brandName: card.brand.name }));
  }

  async brandNames(): Promise<string[]> {
    const brands = await this.dataSource.getRepository(Brand).find({ order: { name: 'ASC' } });
    return brands.map((brand) => brand.name);
  }
}
