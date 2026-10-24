import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Account } from '../../../accounting/domain/entities/account.entity';
import { UsedEntryType, RapOperationType, RapDetailedType, TermType } from './reciept-and-payment-accounting-setting.enum';

@Entity('RecieptAndPaymentAccountingSetting', { schema: 'Rap' })
export class RecieptAndPaymentAccountingSetting extends AppBaseEntity {
  @PrimaryColumn({ 
    name: 'RecieptAndPaymentAccountingSettingID',
    type: 'bigint', 
    transformer: {
      to: (value: number) => value,
      from: (value: any) => parseInt(value, 10),
    } 
  })
  recieptAndPaymentAccountingSettingId: number;

  @Column({ name: 'Code', type: 'varchar', length: 50 })
  code: string;

  @Column({ name: 'Title', type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'Title_En', type: 'varchar', length: 255, nullable: true })
  title_en: string;

  @Column({ 
    name: 'AccountRef', 
    type: 'bigint', 
    nullable: true,
    transformer: {
      to: (value: number | null) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
    }
  })
  accountRef: number;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'AccountRef' })
  account: Account;

  @Column({ name: 'usedEntryType', type: 'int', default: UsedEntryType.Cheque })
  usedEntryType: UsedEntryType;

  @Column({ name: 'operationType', type: 'int', default: RapOperationType.Receipt })
  operationType: RapOperationType;

  @Column({ name: 'detailedType', type: 'int', default: RapDetailedType.Party })
  detailedType: RapDetailedType;

  @Column({ name: 'termType', type: 'int', default: TermType.LongTerm })
  termType: TermType;

  @Column({ name: 'isDefault', type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ name: 'isActive', type: 'boolean', default: true })
  isActive: boolean;
}
