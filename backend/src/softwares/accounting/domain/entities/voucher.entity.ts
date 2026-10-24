import { Entity, PrimaryColumn, Generated, Column, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { VoucherItem } from './voucher-item.entity';

@Entity({ schema: 'Acc', name: 'Voucher' })
export class Voucher extends AppBaseEntity {
  @PrimaryColumn({ 
    name: 'VoucherID', 
    type: 'bigint',
    transformer: {
      to: (value: number | null) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
    }
  })
    voucherId: number;

  @Column({ 
    name: 'VoucherTypeID', 
    type: 'bigint', 
    nullable: true,
    transformer: {
      to: (value: number | null) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
    }
  })
  voucherTypeId: number;

  @Column({ name: 'VoucherNumber', type: 'integer' })
  voucherNumber: number;

  @Column({ name: 'VoucherDate', type: 'date' })
  voucherDate: Date;

  @Column({ name: 'Description', type: 'varchar', length: 500, nullable: true })
  description: string;

  @Column({ name: 'ReferenceNumber', type: 'varchar', length: 100, nullable: true })
  referenceNumber: string;

  @Column({ name: 'SubNumber', type: 'varchar', length: 100, nullable: true })
  subNumber: string;

  @Column({ name: 'VoucherNature', type: 'varchar', length: 100, default: 'عادی', nullable: true })
  voucherNature: string;

  @Column({ name: 'Description2', type: 'varchar', length: 500, nullable: true })
  description2: string;

  @Column({ name: 'SourceDocDate', type: 'date', nullable: true })
  sourceDocDate: Date;

  @Column({ name: 'DailyNumber', type: 'integer', nullable: true })
  dailyNumber: number;

  @Column({ name: 'TotalDebit', type: 'decimal', precision: 18, scale: 4, default: 0 })
  totalDebit: number;

  @Column({ name: 'TotalCredit', type: 'decimal', precision: 18, scale: 4, default: 0 })
  totalCredit: number;

  @Column({ name: 'Status', type: 'smallint', default: 2 }) // default to DocumentState.InitialRegistration
  status: number;

  @Column({ name: 'PreviousStatus', type: 'smallint', nullable: true })
  previousStatus: number;

  @Column({ 
    name: 'FiscalYearRef', 
    type: 'bigint', 
    nullable: true,
    transformer: {
      to: (value: number | null) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
    }
  })
  fiscalYearRef: number;

  @OneToMany(() => VoucherItem, item => item.voucher, { cascade: true, orphanedRowAction: 'delete' })
  items: VoucherItem[];

  voucherType?: any;
  creatorName?: string;
  voucherTypeTitle?: string;
}
