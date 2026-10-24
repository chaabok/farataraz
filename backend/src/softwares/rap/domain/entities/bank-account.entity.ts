import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn , Generated} from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { BankBranch } from './bank-branch.entity';
import { BankAccountType } from './bank-account-type.entity';
import { Account } from '../../../accounting/domain/entities/account.entity';
import { Currency } from '../../../common/domain/entities/currency.entity';

@Entity({ schema: 'Rap', name: 'BankAccounts' })
export class BankAccount extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'BankAccountID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
    bankAccountId: number;

  @Column({ name: 'BankBranchRef', type: 'bigint', nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
  }})
  bankBranchRef: number;

  @ManyToOne(() => BankBranch, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'BankBranchRef', referencedColumnName: 'bankBranchId' })
  bankBranch: BankBranch;

  @Column({ name: 'BankAccountTypeRef', type: 'bigint', nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
  }})
  bankAccountTypeRef: number;

  @ManyToOne(() => BankAccountType, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'BankAccountTypeRef', referencedColumnName: 'bankAccountTypeId' })
  bankAccountType: BankAccountType;

  @Column({ name: 'AccountNumber', type: 'varchar', length: 50, nullable: false })
  accountNumber: string;

  @Column({ name: 'Title', type: 'varchar', length: 250, nullable: true })
  title: string;

  @Column({ name: 'LatinTitle', type: 'varchar', length: 250, nullable: true })
  latinTitle: string;

  @Column({ name: 'ShabaNumber', type: 'varchar', length: 50, nullable: true })
  shabaNumber: string;

  @Column({ name: 'DetailedCode', type: 'bigint', nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
  }})
  detailedCode: number;

  @Column({ name: 'AccountRef', type: 'bigint', nullable: true, transformer: {
    to: (value: number | null) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  }})
  accountRef: number | null;

  @ManyToOne(() => Account, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'AccountRef', referencedColumnName: 'id' })
  account: Account;

  @Column({ name: 'CurrencyRef', type: 'bigint', nullable: true, transformer: {
    to: (value: number | null) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  }})
  currencyRef: number | null;

  @ManyToOne(() => Currency, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'CurrencyRef', referencedColumnName: 'currencyID' })
  currency: Currency;

  @Column({ name: 'InitialBalance', type: 'decimal', precision: 18, scale: 2, nullable: false, default: 1, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseFloat(value.toString()) : 0
  }})
  initialBalance: number;

  @Column({ name: 'OpeningDate', type: 'timestamp', nullable: true })
  openingDate: Date;

  @Column({ name: 'AccountHolderName', type: 'varchar', length: 150, nullable: true })
  accountHolderName: string;

  @Column({ name: 'IsActive', type: 'boolean', default: true })
  isActive: boolean;
}
