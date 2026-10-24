import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn, Generated, Check, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { DetailedAccount } from '../../../accounting/domain/entities/detailed-account.entity';
import { PartyRelated } from './party-related.entity';
import { PartyAddress } from './party-address.entity';
import { PartyPhone } from './party-phone.entity';

@Entity({ schema: 'Gnr', name: 'Parties' })
@Check('"Nature" IN (\'real_person\', \'legal_entity\')')
export class Party extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'PartyID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
    partyId: number;

  @Column({ name: 'Nature', type: 'varchar', length: 50, nullable: false, default: 'real_person' })
  nature: string;

  @Column({ name: 'IsActive', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'SubType', type: 'varchar', length: 50, nullable: true })
  subType: string;

  @Column({ name: 'Website', type: 'varchar', length: 250, nullable: true })
  website: string;

  @Column({ name: 'EmailAddress', type: 'varchar', length: 250, nullable: true })
  email: string;

  @Column({ name: 'FirstName', type: 'varchar', length: 150, nullable: true })
  firstName: string;

  @Column({ name: 'LatinFirstName', type: 'varchar', length: 150, nullable: true })
  latinFirstName: string;

  @Column({ name: 'LastName', type: 'varchar', length: 150, nullable: true })
  lastName: string;

  @Column({ name: 'LatinLastName', type: 'varchar', length: 150, nullable: true })
  latinLastName: string;

  @Column({ name: 'DetailedAccountID', type: 'bigint', nullable: true, unique: true, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  }})
  detailedAccountId: number;

  @OneToOne(() => DetailedAccount, { eager: true, cascade: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'DetailedAccountID', referencedColumnName: 'detailedAccountId' })
  detailedAccount: DetailedAccount;

  @Column({ name: 'EconomicCode', type: 'varchar', length: 50, nullable: true })
  economicCode: string;

  @Column({ name: 'NationalCode', type: 'varchar', length: 50, nullable: true })
  nationalCode: string;

  @Column({ name: 'PassportNumber', type: 'varchar', length: 50, nullable: true })
  passportNumber: string;

  @Column({ name: 'BirthDate', type: 'date', nullable: true })
  birthDate: Date;

  @Column({ name: 'MarriageDate', type: 'date', nullable: true })
  marriageDate: Date;

  @Column({ name: 'NationalId', type: 'varchar', length: 50, nullable: true })
  nationalId: string;

  @Column({ name: 'RegistrationNumber', type: 'varchar', length: 50, nullable: true })
  registrationNumber: string;

  @Column({ name: 'IsSupplier', type: 'boolean', default: false, nullable: true })
  isSupplier: boolean;

  @Column({ name: 'Balance', type: 'varchar', length: 50, nullable: true })
  balance: string;

  @Column({ name: 'BalanceStatus', type: 'varchar', length: 50, nullable: true })
  balanceStatus: string;

  @Column({ name: 'IsCustomer', type: 'boolean', default: false, nullable: true })
  isCustomer: boolean;

  @Column({ name: 'CustomerBalance', type: 'varchar', length: 50, nullable: true })
  customerBalance: string;

  @Column({ name: 'CustomerBalanceStatus', type: 'varchar', length: 50, nullable: true })
  customerBalanceStatus: string;

  @Column({ name: 'IsSalesIntermediary', type: 'boolean', default: false, nullable: true })
  isSalesIntermediary: boolean;

  @Column({ name: 'SalesIntermediaryBalance', type: 'varchar', length: 50, nullable: true })
  salesIntermediaryBalance: string;

  @Column({ name: 'SalesIntermediaryBalanceStatus', type: 'varchar', length: 50, nullable: true })
  salesIntermediaryBalanceStatus: string;

  @OneToMany(() => PartyRelated, (related) => related.party, { cascade: true, eager: true, orphanedRowAction: 'delete' })
  partyRelatedPersons: PartyRelated[];

  @OneToMany(() => PartyAddress, (address) => address.party, { cascade: true, eager: true, orphanedRowAction: 'delete' })
  partyAddresses: PartyAddress[];

  @OneToMany(() => PartyPhone, (phone) => phone.party, { cascade: true, eager: true, orphanedRowAction: 'delete' })
  partyPhones: PartyPhone[];
}
