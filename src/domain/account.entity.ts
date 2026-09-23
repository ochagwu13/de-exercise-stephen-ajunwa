import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Customer } from './customer.entity';

@Entity()
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  accountNumber!: string;

  @ManyToOne(() => Customer, { nullable: false })
  customer!: Customer;

  @Column({ type: 'integer' })
  creditLimitMinorUnits!: number;

  @Column({ length: 3 })
  currency!: string;
}
