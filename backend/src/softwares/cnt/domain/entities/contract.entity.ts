import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { DetailedAccount } from '../../../accounting/domain/entities/detailed-account.entity';
import { Project } from './project.entity';
import { Party } from '../../../common/domain/entities/party.entity';

@Entity({ schema: 'Cnt', name: 'Contracts' })
export class Contract extends AppBaseEntity {
  @PrimaryColumn({ 
    name: 'ContractID', 
    type: 'bigint',
    //@ts-ignore
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  } as any)
  contractId: number;

  @Column({ name: 'DocumentNumber', type: 'varchar', length: 100, nullable: false })
  documentNumber: string;

  @Column({ name: 'Date', type: 'varchar', length: 20, nullable: false })
  date: string;

  @Index()
  @Column({ name: 'ProjectID', type: 'bigint', nullable: true, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  }})
  projectId: number;

  @ManyToOne(() => Project, { eager: true, nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'ProjectID', referencedColumnName: 'projectId' })
  project: Project;

  @Column({ name: 'WorkLocation', type: 'varchar', length: 200, nullable: true })
  workLocation: string;

  @Index()
  @Column({ name: 'PartyID', type: 'bigint', nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  }})
  partyId: number;

  @ManyToOne(() => Party, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'PartyID', referencedColumnName: 'partyId' })
  party: Party;

  @Column({ name: 'DetailedAccountCode', type: 'varchar', length: 50, nullable: true })
  detailedAccountCode: string;

  @Index()
  @Column({ name: 'DetailedAccountID', type: 'bigint', nullable: true, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  }})
  detailedAccountId: number;

  @ManyToOne(() => DetailedAccount, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'DetailedAccountID', referencedColumnName: 'detailedAccountId' })
  detailedAccount: DetailedAccount;

  @Column({ name: 'Subject1', type: 'varchar', length: 200, nullable: false })
  subject1: string;

  @Column({ name: 'Subject2', type: 'varchar', length: 200, nullable: true })
  subject2: string;

  @Column({ name: 'DetailedAccountTitle', type: 'varchar', length: 200, nullable: false })
  detailedAccountTitle: string;

  @Column({ name: 'DetailedAccountTitle2', type: 'varchar', length: 200, nullable: true })
  detailedAccountTitle2: string;

  @Column({ name: 'StartDate', type: 'varchar', length: 20, nullable: true })
  startDate: string;

  @Column({ name: 'EndDate', type: 'varchar', length: 20, nullable: true })
  endDate: string;

  @Column({ name: 'DurationDays', type: 'int', nullable: true })
  durationDays: number;

  @Column({ name: 'Amount', type: 'bigint', nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
  } as any })
  amount: number;

  @Column({ name: 'Description1', type: 'text', nullable: true })
  description1: string;

  @Column({ name: 'Description2', type: 'text', nullable: true })
  description2: string;

  @Column({ name: 'IsActive', type: 'boolean', default: true })
  isActive: boolean;
}
