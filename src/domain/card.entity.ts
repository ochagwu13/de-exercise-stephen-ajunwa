import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Account } from './account.entity';
import { Brand } from './brand.entity';

@Entity()
export class Card {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  cardNumber!: string;

  @Column({ type: 'integer' })
  expiryMonth!: number;

  @Column({ type: 'integer' })
  expiryYear!: number;

  @ManyToOne(() => Brand, { nullable: false })
  brand!: Brand;

  @ManyToOne(() => Account, { nullable: false })
  account!: Account;
}
