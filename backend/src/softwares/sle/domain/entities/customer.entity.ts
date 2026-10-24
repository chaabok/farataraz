import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Party } from '../../../common/domain/entities/party.entity';
import { CustomerGroup } from './customer-group.entity';
import { Currency } from '../../../common/domain/entities/currency.entity';

@Entity({ schema: 'Sle', name: 'Customers' })
export class Customer {
  @PrimaryColumn({ type: 'bigint' })
  CustomerID!: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  Code!: string;

  @Column({ type: 'int', default: 1 })
  CustomerType!: number; // 1: عادی, 2: متفرقه

  @Column({ type: 'bigint', nullable: true })
  PartyRef?: number;

  @ManyToOne(() => Party, { nullable: true, eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'PartyRef', referencedColumnName: 'partyId' })
  party?: Party;

  @Column({ type: 'bigint', nullable: true })
  CustomerGroupRef?: number;

  @ManyToOne(() => CustomerGroup, { nullable: true, eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'CustomerGroupRef', referencedColumnName: 'CustomerGroupID' })
  customerGroup?: CustomerGroup;

  @Column({ type: 'text', nullable: true })
  SalesChannels?: string;

  @Column({ type: 'int', default: 1 })
  SalesStatus!: number; // 1: فروش مستقیم, 2: فروش غیرمستقیم واسط بدهکار, 3: فروش غیرمستقیم مشتری بدهکار

  @Column({ type: 'bigint', nullable: true })
  SalesIntermediaryRef?: number;

  @ManyToOne(() => Party, { nullable: true, eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'SalesIntermediaryRef', referencedColumnName: 'partyId' })
  salesIntermediary?: Party;

  @Column({ type: 'text', nullable: true })
  SalesTypes?: string;

  @Column({ type: 'bigint', nullable: true })
  CurrencyRef?: number;

  @ManyToOne(() => Currency, { nullable: true, eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'CurrencyRef', referencedColumnName: 'currencyID' })
  currency?: Currency;

  @Column({ type: 'boolean', default: true })
  IsActive!: boolean;

  // Inherited / System fields at the end (Rule 17)
  @Column({ type: 'bigint', nullable: true })
  BusinessStructureRef?: number;

  @Column({ type: 'bigint', nullable: true })
  CompanyRef?: number;

  @Column({ type: 'bigint', nullable: true })
  FiscalYearRef?: number;

  @Column({ type: 'bigint', nullable: true })
  CreatorRef?: number;

  @Column({ type: 'timestamp', nullable: true })
  CreationDate?: Date;

  @Column({ type: 'bigint', nullable: true })
  LastModifierRef?: number;

  @Column({ type: 'timestamp', nullable: true })
  LastModificationDate?: Date;
}
