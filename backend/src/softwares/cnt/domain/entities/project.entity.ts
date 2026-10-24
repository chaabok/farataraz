import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { DetailedAccount } from '../../../accounting/domain/entities/detailed-account.entity';

@Entity({ schema: 'Cnt', name: 'Projects' })
export class Project extends AppBaseEntity {
  @PrimaryColumn({ 
    name: 'ProjectID', 
    type: 'bigint',
    // We still keep the transformer because bigint is returned as string by pg driver
    //@ts-ignore
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  } as any)
  projectId: number;

  @Column({ name: 'Code', type: 'varchar', length: 20, nullable: false })
  code: string;

  @Column({ name: 'Title', type: 'varchar', length: 200, nullable: false })
  title: string;

  @Column({ name: 'Title_En', type: 'varchar', length: 200, nullable: true })
  titleEn: string;

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

  @Column({ name: 'IsActive', type: 'boolean', default: true })
  isActive: boolean;
}
