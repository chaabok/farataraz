import { Entity, Column, PrimaryColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { DetailedAccount } from '../../../accounting/domain/entities/detailed-account.entity';

@Entity({ schema: 'Sle', name: 'CustomerGroups' })
export class CustomerGroup extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  CustomerGroupID: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  Code: string;

  @Column({ type: 'varchar', length: 250, nullable: false })
  Title: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  Title2: string;

  @Column({ type: 'bigint', nullable: true })
  DetailedAccountRef: number | null;

  @ManyToOne(() => DetailedAccount, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'DetailedAccountRef', referencedColumnName: 'detailedAccountId' })
  detailedAccount?: DetailedAccount;

  @Column({ type: 'varchar', length: 500, nullable: true })
  Description: string;

  @Column({ type: 'boolean', default: false, nullable: true })
  IsMandatory: boolean;

  @Column({ type: 'bigint', nullable: true })
  ParentRef: number | null;

  @ManyToOne(() => CustomerGroup, (group) => group.children, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ParentRef', referencedColumnName: 'CustomerGroupID' })
  parent?: CustomerGroup;

  @OneToMany(() => CustomerGroup, (group) => group.parent)
  children?: CustomerGroup[];
}
