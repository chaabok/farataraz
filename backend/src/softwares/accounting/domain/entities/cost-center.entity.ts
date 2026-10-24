import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Generated, Index, Unique, Check } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { DetailedAccount } from './detailed-account.entity';
import { CostCenterType } from './cost-center.enum';

@Entity({ schema: 'Acc', name: 'CostCenter' })
@Check('length("Code") > 0')
export class CostCenter extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'CostCenterID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
    costCenterId: number;

  @Column({ name: 'Code', type: 'varchar', length: 20, nullable: false })
  code: string;

  @Column({ name: 'Title', type: 'varchar', length: 100, nullable: false })
  title: string;

  @Column({ name: 'Title_En', type: 'varchar', length: 100, nullable: true })
  title_en: string;

  @Column({ name: 'CostCenterType', type: 'int', enum: CostCenterType, nullable: false })
  costCenterType: CostCenterType;

  @Index()
  @Column({ name: 'DetailedAccountID', type: 'bigint', nullable: true, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  }})
  detailedAccountId: number;

  @ManyToOne(() => DetailedAccount, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'DetailedAccountID' })
  detailedAccount: DetailedAccount;

  @Column({ name: 'isActive', type: 'boolean', default: true, nullable: false })
  isActive: boolean;

  @Column({ name: 'Description', type: 'text', nullable: true })
  description: string;
}
