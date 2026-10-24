import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { BankAccount } from './bank-account.entity';
import { DetailedAccount } from '../../../accounting/domain/entities/detailed-account.entity';
import { Party } from '../../../common/domain/entities/party.entity';
import { PaymentGatewayContact } from './payment-gateway-contact.entity';
import { PaymentGatewayType } from './payment-gateway-type.enum';

@Entity({ schema: 'Rap', name: 'PaymentGateways' })
export class PaymentGateway extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'PaymentGatewayID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
    paymentGatewayId: number;

  @Column({ name: 'GatewayType', type: 'varchar', length: 50, nullable: false, default: PaymentGatewayType.INTERNET })
  gatewayType: PaymentGatewayType;

  // The PSP Company / Terminal Provider (linked to Party per requirement)
  @Column({ name: 'PartiesRef', type: 'bigint', nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
  }})
  partiesRef: number;

  @ManyToOne(() => Party, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'PartiesRef', referencedColumnName: 'partyId' })
  party: Party;

  // The Detailed Account (کد تفصیلی)
  @Column({ name: 'DetailedAccountRef', type: 'bigint', nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
  }})
  detailedAccountRef: number;

  @ManyToOne(() => DetailedAccount, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'DetailedAccountRef', referencedColumnName: 'detailedAccountId' })
  detailedAccount: DetailedAccount;

  // The Bank Account connected to this gateway
  @Column({ name: 'BankAccountRef', type: 'bigint', nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
  }})
  bankAccountRef: number;

  @ManyToOne(() => BankAccount, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'BankAccountRef', referencedColumnName: 'bankAccountId' })
  bankAccount: BankAccount;

  @Column({ name: 'GatewayIdString', type: 'varchar', length: 150, nullable: true })
  gatewayIdString: string;

  @Column({ name: 'IsActive', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => PaymentGatewayContact, (contact) => contact.paymentGateway, { cascade: true, eager: true, orphanedRowAction: 'delete' })
  contacts: PaymentGatewayContact[];
}
