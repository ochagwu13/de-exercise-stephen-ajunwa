import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Customer } from './customer.entity';

@Entity()
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  accountNumber!: string;

  @OneToOne(() => Customer, { nullable: false })
  @JoinColumn()
  customer!: Customer;

  @Column({ type: 'integer' })
  creditLimitMinorUnits!: number;

  @Column({ length: 3 })
  currency!: string;
}
